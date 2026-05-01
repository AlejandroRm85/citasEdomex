// src/services/juzgados.service.ts
import { supabase, Juzgado } from './supabase';

// Obtener juzgados activos filtrados por materia
export const getJuzgadosPorMateria = async (materiaId: number): Promise<Juzgado[]> => {
  const { data, error } = await supabase
    .from('juzgados')
    .select('*, materias(id, nombre, icono)')
    .eq('materia_id', materiaId)
    .eq('estatus', true)
    .order('municipio');

  if (error) throw error;
  return data as Juzgado[];
};

// Obtener todos los juzgados activos
export const getTodosJuzgados = async (): Promise<Juzgado[]> => {
  const { data, error } = await supabase
    .from('juzgados')
    .select('*, materias(id, nombre, icono)')
    .eq('estatus', true)
    .order('nombre');

  if (error) throw error;
  return data as Juzgado[];
};

// Obtener un juzgado por ID
export const getJuzgadoById = async (juzgadoId: string): Promise<Juzgado> => {
  const { data, error } = await supabase
    .from('juzgados')
    .select('*, materias(id, nombre, icono)')
    .eq('id', juzgadoId)
    .single();

  if (error) throw error;
  return data as Juzgado;
};
