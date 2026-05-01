// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, Perfil } from '../services/supabase';
import { getMiPerfil } from '../services/auth.service';

export const useAuth = () => {
  const [session, setSesion]  = useState<Session | null>(null);
  const [perfil,  setPerfil]  = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      if (session) cargarPerfil();
      else setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSesion(session);
        if (session) cargarPerfil();
        else { setPerfil(null); setLoading(false); }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const cargarPerfil = async () => {
    try {
      const datos = await getMiPerfil();
      setPerfil(datos);
    } catch (e) {
      console.error('Error al cargar perfil:', e);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    perfil,
    loading,
    isAuthenticated: !!session,
    recargarPerfil: cargarPerfil,
  };
};
