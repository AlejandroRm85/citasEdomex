// src/hooks/useCitas.ts
import { useState, useEffect, useCallback } from 'react';
import { Cita } from '../services/supabase';
import {
  getMisCitas,
  getCitasProximas,
  cancelarCita as cancelarCitaService,
} from '../services/citas.service';

export const useMisCitas = () => {
  const [citas,   setCitas]   = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const datos = await getMisCitas();
      setCitas(datos);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const cancelar = async (citaId: string) => {
    try {
      await cancelarCitaService(citaId);
      await cargar(); // refrescar lista
    } catch (e: any) {
      throw new Error(e.message ?? 'No se pudo cancelar la cita');
    }
  };

  const proximas  = citas.filter(c => c.estado === 'programada');
  const historial = citas.filter(c => c.estado !== 'programada');

  return { citas, proximas, historial, loading, error, recargar: cargar, cancelar };
};

export const useCitasProximas = (limite = 3) => {
  const [citas,   setCitas]   = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const datos = await getCitasProximas(limite);
      setCitas(datos);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [limite]);

  useEffect(() => { cargar(); }, [cargar]);

  return { citas, loading, error, recargar: cargar };
};
