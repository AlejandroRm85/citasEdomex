// src/services/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================================
// Tipos TypeScript — espejo del schema SQL
// ============================================================

export type TipoUsuario = 'ciudadano' | 'abogado' | 'admin';
export type EstadoCita  = 'programada' | 'completada' | 'cancelada';

export interface Perfil {
  id:                 string;
  nombre_completo:    string;
  curp:               string;
  tipo_usuario:       TipoUsuario;
  cedula_profesional: string | null;
  telefono:           string | null;
  created_at:         string;
}

export interface Materia {
  id:      number;
  nombre:  string;
  icono:   string;
  estatus: boolean;
}

export interface Juzgado {
  id:                 string;
  nombre:             string;
  materia_id:         number;
  municipio:          string;
  direccion:          string | null;
  capacidad_por_hora: number;
  estatus:            boolean;
  materias?:          Materia;
}

export interface Cita {
  id:         string;
  usuario_id: string;
  juzgado_id: string;
  fecha_cita: string;   // 'YYYY-MM-DD'
  hora_cita:  string;   // 'HH:MM:SS'
  estado:     EstadoCita;
  qr_token:   string;
  notas:      string | null;
  creado_en:  string;
  juzgados?:  Juzgado;
}

// Tipo para crear cita (sin campos autogenerados)
export type NuevaCita = Pick<Cita, 'juzgado_id' | 'fecha_cita' | 'hora_cita'> & {
  notas?: string;
};

// Tipo para registro de nuevo usuario
export interface DatosRegistro {
  email:           string;
  password:        string;
  nombre_completo: string;
  curp:            string;
  telefono?:       string;
  tipo_usuario?:   TipoUsuario;
  cedula_profesional?: string;
}
