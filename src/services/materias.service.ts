// src/services/materias.service.ts
import { supabase, Materia } from './supabase';

export const getMaterias = async (): Promise<Materia[]> => {
  const { data, error } = await supabase
    .from('materias')
    .select('*')
    .eq('estatus', true)
    .order('id');

  if (error) throw error;
  return data as Materia[];
};
