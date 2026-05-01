// src/services/auth.service.ts
import { supabase, DatosRegistro, Perfil } from './supabase';

// ── Registro ────────────────────────────────────────────────
export const registrarUsuario = async (datos: DatosRegistro) => {
  const { email, password, nombre_completo, curp, telefono,
          tipo_usuario = 'ciudadano', cedula_profesional } = datos;

  // 1. Crear cuenta en auth.users (el trigger crea el perfil base)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre_completo, curp }, // metadata para el trigger
    },
  });
  if (authError) throw authError;

  // 2. Actualizar perfil con datos adicionales
  if (authData.user) {
    const { error: perfilError } = await supabase
      .from('perfiles')
      .update({ nombre_completo, curp, telefono, tipo_usuario, cedula_profesional })
      .eq('id', authData.user.id);
    if (perfilError) throw perfilError;
  }

  return authData;
};

// ── Login ────────────────────────────────────────────────────
export const iniciarSesion = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

// ── Logout ───────────────────────────────────────────────────
export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ── Obtener perfil del usuario autenticado ───────────────────
export const getMiPerfil = async (): Promise<Perfil> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw authError ?? new Error('No autenticado');

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data as Perfil;
};

// ── Actualizar perfil ────────────────────────────────────────
export const actualizarPerfil = async (campos: Partial<Omit<Perfil, 'id' | 'created_at'>>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('perfiles')
    .update(campos)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Perfil;
};

// ── Recuperar contraseña ─────────────────────────────────────
export const recuperarPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'citasedomex://reset-password',
  });
  if (error) throw error;
};

// ── Sesión activa ────────────────────────────────────────────
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
