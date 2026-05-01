# CitasEdomex 🏛️
**Aplicación móvil para agendar citas para trámites presenciales**

Stack: React Native (Expo) + Supabase (PostgreSQL + Auth)

---

## ⚡ Inicio rápido

### 1. Clonar e instalar
```bash
git https://github.com/AlejandroRm85/citasEdomex.git
cd citasedomex
npm install
```

### 2. Configurar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el archivo `supabase/schema.sql` completo
3. En **Project Settings → API**, copia tu URL y anon key

### 3. Variables de entorno
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales:
```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Ejecutar
```bash
# En iOS Simulator
npm run ios

# En Android Emulator
npm run android

# Escanear QR con Expo Go
npm start
```

---

## 🗂️ Estructura del proyecto

```
CitasEdomex/
├── App.tsx                          # Punto de entrada
├── supabase/
│   └── schema.sql                   # Schema completo (tablas, RLS, triggers, funciones)
├── src/
│   ├── theme/
│   │   └── colors.ts                # Paleta institucional Edomex
│   ├── services/
│   │   ├── supabase.ts              # Cliente + tipos TypeScript
│   │   ├── auth.service.ts          # Login, registro, perfil
│   │   ├── citas.service.ts         # CRUD citas, horarios
│   │   ├── juzgados.service.ts      # Consulta por materia
│   │   └── materias.service.ts      # Catálogo materias
│   ├── hooks/
│   │   ├── useAuth.ts               # Sesión y perfil reactivo
│   │   ├── useCitas.ts              # Lista y acciones de citas
│   │   └── useJuzgados.ts           # Juzgados por materia
│   ├── store/
│   │   └── agendamiento.store.ts    # Estado del flujo (Zustand)
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Root (Auth vs Main)
│   │   ├── AuthNavigator.tsx        # Stack Login/Registro
│   │   └── MainNavigator.tsx        # Tab bar + Stack agendamiento
│   ├── components/
│   │   ├── TopBar.tsx               # Barra superior reutilizable
│   │   └── PasoIndicador.tsx        # Indicador de pasos 1–4
│   └── screens/
│       ├── auth/
│       │   ├── LoginScreen.tsx
│       │   └── RegisterScreen.tsx
│       ├── dashboard/
│       │   └── DashboardScreen.tsx
│       ├── agendamiento/
│       │   ├── MateriaScreen.tsx     # Paso 1
│       │   ├── JuzgadoScreen.tsx     # Paso 2
│       │   ├── FechaHoraScreen.tsx   # Paso 3
│       │   ├── ConfirmacionScreen.tsx # Paso 4
│       │   └── TicketScreen.tsx      # QR digital
│       ├── historial/
│       │   └── HistorialScreen.tsx
│       └── perfil/
│           └── PerfilScreen.tsx
```

---

## 🗄️ Base de datos (Supabase)

### Tablas
| Tabla      | Descripción                                  |
|------------|----------------------------------------------|
| `perfiles` | Vinculada a `auth.users`. Datos del usuario  |
| `materias` | Catálogo: Familiar, Civil, Penal, Mercantil  |
| `juzgados` | Catálogo de juzgados por materia y municipio |
| `citas`    | Tabla transaccional. Incluye `qr_token` UUID |

### Seguridad (RLS)
- Cada usuario **solo puede ver y modificar sus propias citas y perfil**
- Materias y juzgados son **lectura pública** (catálogos)
- Cancelación de citas restringida a estado `programada`

### Funciones SQL clave
- `handle_new_user()` — Crea perfil automáticamente al registrarse
- `verificar_capacidad_juzgado()` — Trigger que bloquea overbooking
- `get_horarios_ocupados(juzgado_id, fecha)` — RPC para horarios llenos

---

## 🔄 Flujo de agendamiento

```
Dashboard
   │
   ▼  "Nueva Cita"
[1] MateriaScreen     → setMateria(materia)
   │
   ▼
[2] JuzgadoScreen     → setJuzgado(juzgado)   (filtrado por materia)
   │
   ▼
[3] FechaHoraScreen   → setFecha + setHora     (calendario + slots)
   │                    (horarios_ocupados vía RPC)
   ▼
[4] ConfirmacionScreen → agendarCita() → INSERT en Supabase
   │
   ▼
    TicketScreen       → QR con qr_token único
```

---

## 🧩 Dependencias principales

| Paquete                          | Uso                         |
|----------------------------------|-----------------------------|
| `@supabase/supabase-js`          | Backend / Auth / DB         |
| `@react-navigation/native`       | Navegación entre pantallas  |
| `@react-navigation/bottom-tabs`  | Tab bar inferior            |
| `@react-navigation/stack`        | Flujo agendamiento          |
| `zustand`                        | Estado global del flujo     |
| `react-native-qrcode-svg`        | Generación de QR            |
| `date-fns`                       | Formato de fechas en español|
| `@react-native-async-storage`    | Persistencia de sesión      |

---

## 🚀 Próximas mejoras sugeridas
- [ ] Notificaciones push (Expo Notifications) 24h antes de la cita
- [ ] Búsqueda de juzgados por municipio con mapa
- [ ] Módulo admin para gestionar disponibilidad
- [ ] Confirmación de cita por email (Supabase Edge Functions)
- [ ] Soporte para reagendar (mover fecha/hora sin cancelar)
