// src/services/citas.service.ts
import { supabase, Cita, NuevaCita } from './supabase';
import { format } from 'date-fns';

// Horarios de atención (9am–2pm, cada 30 min)
export const HORARIOS_DISPONIBLES = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00',
];

// ── Agendar cita ─────────────────────────────────────────────
export const agendarCita = async (nueva: NuevaCita): Promise<Cita> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión para agendar una cita.');

  const { data, error } = await supabase
    .from('citas')
    .insert({ ...nueva, usuario_id: user.id })
    .select('*, juzgados(*, materias(*))')
    .single();

  if (error) {
    // Supabase lanza el error del trigger como error de PostgreSQL
    if (error.message.includes('disponibilidad')) {
      throw new Error('El horario seleccionado ya no está disponible. Por favor elige otro.');
    }
    if (error.code === '23505') {
      throw new Error('Ya existe una cita para ese juzgado, fecha y hora.');
    }
    throw error;
  }
  return data as Cita;
};

// ── Obtener mis citas ─────────────────────────────────────────
export const getMisCitas = async (estado?: Cita['estado']): Promise<Cita[]> => {
  let query = supabase
    .from('citas')
    .select('*, juzgados(*, materias(*))')
    .order('fecha_cita', { ascending: true })
    .order('hora_cita',  { ascending: true });

  if (estado) query = query.eq('estado', estado);

  const { data, error } = await query;
  if (error) throw error;
  return data as Cita[];
};

// ── Obtener citas próximas (para Dashboard) ───────────────────
export const getCitasProximas = async (limite = 3): Promise<Cita[]> => {
  const hoy = format(new Date(), 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('citas')
    .select('*, juzgados(*, materias(*))')
    .eq('estado', 'programada')
    .gte('fecha_cita', hoy)
    .order('fecha_cita', { ascending: true })
    .order('hora_cita',  { ascending: true })
    .limit(limite);

  if (error) throw error;
  return data as Cita[];
};

// ── Cancelar cita ─────────────────────────────────────────────
export const cancelarCita = async (citaId: string): Promise<void> => {
  const { error } = await supabase
    .from('citas')
    .update({ estado: 'cancelada' })
    .eq('id', citaId)
    .eq('estado', 'programada'); // Solo cancelar programadas

  if (error) throw error;
};

// ── Obtener una cita por ID (para Ticket) ────────────────────
export const getCitaById = async (citaId: string): Promise<Cita> => {
  const { data, error } = await supabase
    .from('citas')
    .select('*, juzgados(*, materias(*))')
    .eq('id', citaId)
    .single();

  if (error) throw error;
  return data as Cita;
};

// ── Horarios ocupados para un juzgado/fecha ───────────────────
// Usa la función RPC definida en el schema SQL
export const getHorariosOcupados = async (
  juzgadoId: string,
  fecha: string   // 'YYYY-MM-DD'
): Promise<string[]> => {
  const { data, error } = await supabase.rpc('get_horarios_ocupados', {
    p_juzgado_id: juzgadoId,
    p_fecha:      fecha,
  });

  if (error) throw error;
  // Devuelve lista de horas en formato 'HH:MM'
  return (data ?? []).map((row: { hora_cita: string }) =>
    row.hora_cita.substring(0, 5)
  );
};

// ── Formatear hora para mostrar (09:30 → 9:30 AM) ────────────
export const formatearHora = (horaSQL: string): string => {
  const [h, m] = horaSQL.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};
