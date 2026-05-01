// src/hooks/useJuzgados.ts
import { useState, useEffect } from 'react';
import { Juzgado } from '../services/supabase';
import { getJuzgadosPorMateria } from '../services/juzgados.service';

export const useJuzgados = (materiaId: number | null) => {
  const [juzgados, setJuzgados] = useState<Juzgado[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!materiaId) return;

    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);
        const datos = await getJuzgadosPorMateria(materiaId);
        setJuzgados(datos);
      } catch (e: any) {
        setError(e.message ?? 'Error al cargar juzgados');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [materiaId]);

  return { juzgados, loading, error };
};
