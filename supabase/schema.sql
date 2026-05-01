-- ============================================================
-- CitasEdomex — Schema completo con RLS y funciones
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- 0. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLAS
-- ============================================================

-- 1. Perfiles (vinculado a auth.users)
CREATE TABLE public.perfiles (
    id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    curp            VARCHAR(18)  UNIQUE NOT NULL,
    tipo_usuario    VARCHAR(50)  DEFAULT 'ciudadano' CHECK (tipo_usuario IN ('ciudadano','abogado','admin')),
    cedula_profesional VARCHAR(50),
    telefono        VARCHAR(20),
    created_at      TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Materias (catálogo)
CREATE TABLE public.materias (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL,
    icono   VARCHAR(50)  DEFAULT '⚖️',
    estatus BOOLEAN DEFAULT TRUE
);

INSERT INTO public.materias (nombre, icono) VALUES
    ('Familiar',   '👨‍👩‍👧'),
    ('Civil',      '⚖️'),
    ('Penal',      '🔒'),
    ('Mercantil',  '🏛️');

-- 3. Juzgados
CREATE TABLE public.juzgados (
    id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre            VARCHAR(255) NOT NULL,
    materia_id        INT REFERENCES public.materias(id) ON DELETE RESTRICT,
    municipio         VARCHAR(100) NOT NULL,
    direccion         VARCHAR(255),
    capacidad_por_hora INT NOT NULL DEFAULT 4,
    estatus           BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT timezone('utc', now())
);

INSERT INTO public.juzgados (nombre, materia_id, municipio, direccion, capacidad_por_hora) VALUES
    ('Juzgado Familiar No. 1', 1, 'Toluca',    'Av. Hidalgo 100, Centro',      4),
    ('Juzgado Familiar No. 3', 1, 'Toluca',    'Paseo Tollocan 350',            4),
    ('Juzgado Familiar No. 7', 1, 'Metepec',   'Av. Tecnológico 200, Metepec', 3),
    ('Juzgado Familiar No. 12',1, 'Naucalpan', 'Blvd. Toluca-Naucalpan 45',    4),
    ('Juzgado Familiar No. 2', 1, 'Ecatepec',  'Av. Central s/n, Ecatepec',    4),
    ('Juzgado Civil No. 1',    2, 'Toluca',    'Av. Independencia 200',         4),
    ('Juzgado Civil No. 4',    2, 'Naucalpan', 'Blvd. Toluca-Naucalpan 78',    3),
    ('Juzgado Civil No. 6',    2, 'Ecatepec',  'Calle Juárez 15, Ecatepec',    4),
    ('Juzgado Penal No. 2',    3, 'Toluca',    'Av. Lerdo de Tejada 80',        4),
    ('Juzgado Penal No. 5',    3, 'Tlalnepantla','Av. Mario Colín 300',         3),
    ('Juzgado Penal No. 8',    3, 'Ecatepec',  'Av. Central s/n, Ecatepec',    4),
    ('Juzgado Mercantil No. 1',4, 'Toluca',    'Av. Hidalgo 220, Centro',       4),
    ('Juzgado Mercantil No. 2',4, 'Ecatepec',  'Blvd. de los Aztecas 400',     3),
    ('Juzgado Mercantil No. 3',4, 'Naucalpan', 'Av. Lomas Verdes 250',         4);

-- 4. Citas (tabla transaccional central)
CREATE TABLE public.citas (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id  UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    juzgado_id  UUID REFERENCES public.juzgados(id) ON DELETE RESTRICT,
    fecha_cita  DATE NOT NULL,
    hora_cita   TIME NOT NULL,
    estado      VARCHAR(50) DEFAULT 'programada' CHECK (estado IN ('programada','completada','cancelada')),
    qr_token    UUID DEFAULT uuid_generate_v4() UNIQUE,
    notas       TEXT,
    creado_en   TIMESTAMPTZ DEFAULT timezone('utc', now()),
    UNIQUE (juzgado_id, fecha_cita, hora_cita)  -- evita doble booking
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.perfiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.juzgados   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas      ENABLE ROW LEVEL SECURITY;

-- Perfiles: cada usuario ve y edita solo el suyo
CREATE POLICY "perfiles_select_own" ON public.perfiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "perfiles_insert_own" ON public.perfiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "perfiles_update_own" ON public.perfiles
    FOR UPDATE USING (auth.uid() = id);

-- Materias: lectura pública (catálogo)
CREATE POLICY "materias_select_all" ON public.materias
    FOR SELECT USING (estatus = TRUE);

-- Juzgados: lectura pública (catálogo)
CREATE POLICY "juzgados_select_all" ON public.juzgados
    FOR SELECT USING (estatus = TRUE);

-- Citas: usuario solo ve las suyas
CREATE POLICY "citas_select_own" ON public.citas
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "citas_insert_own" ON public.citas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "citas_update_own" ON public.citas
    FOR UPDATE USING (auth.uid() = usuario_id AND estado = 'programada');

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- Función: crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfiles (id, nombre_completo, curp)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'curp', 'PENDIENTE' || NEW.id::text)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función: verificar capacidad del juzgado antes de insertar cita
CREATE OR REPLACE FUNCTION public.verificar_capacidad_juzgado()
RETURNS TRIGGER AS $$
DECLARE
    capacidad     INT;
    citas_actuales INT;
BEGIN
    SELECT capacidad_por_hora INTO capacidad
    FROM public.juzgados WHERE id = NEW.juzgado_id;

    SELECT COUNT(*) INTO citas_actuales
    FROM public.citas
    WHERE juzgado_id = NEW.juzgado_id
      AND fecha_cita = NEW.fecha_cita
      AND hora_cita  = NEW.hora_cita
      AND estado     = 'programada';

    IF citas_actuales >= capacidad THEN
        RAISE EXCEPTION 'El horario seleccionado ya no tiene disponibilidad.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_capacidad_before_insert
    BEFORE INSERT ON public.citas
    FOR EACH ROW EXECUTE FUNCTION public.verificar_capacidad_juzgado();

-- Función: obtener horarios ocupados para una fecha/juzgado
CREATE OR REPLACE FUNCTION public.get_horarios_ocupados(
    p_juzgado_id UUID,
    p_fecha      DATE
)
RETURNS TABLE(hora_cita TIME, ocupados BIGINT, capacidad INT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.hora_cita,
        COUNT(*) AS ocupados,
        j.capacidad_por_hora AS capacidad
    FROM public.citas c
    JOIN public.juzgados j ON j.id = c.juzgado_id
    WHERE c.juzgado_id = p_juzgado_id
      AND c.fecha_cita  = p_fecha
      AND c.estado      = 'programada'
    GROUP BY c.hora_cita, j.capacidad_por_hora
    HAVING COUNT(*) >= j.capacidad_por_hora;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ÍNDICES para rendimiento
-- ============================================================
CREATE INDEX idx_citas_usuario    ON public.citas(usuario_id);
CREATE INDEX idx_citas_juzgado_fecha ON public.citas(juzgado_id, fecha_cita);
CREATE INDEX idx_juzgados_materia ON public.juzgados(materia_id);
CREATE INDEX idx_citas_estado     ON public.citas(estado);
