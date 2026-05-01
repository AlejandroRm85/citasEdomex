// src/store/agendamiento.store.ts
// Estado global del flujo de agendamiento (Zustand)
import { create } from 'zustand';
import { Materia, Juzgado } from '../services/supabase';

interface AgendamientoState {
  // Paso 1
  materia:    Materia | null;
  // Paso 2
  juzgado:    Juzgado | null;
  // Paso 3
  fecha:      string;   // 'YYYY-MM-DD'
  hora:       string;   // 'HH:MM'
  // Notas opcionales
  notas:      string;

  // Acciones
  setMateria:  (materia: Materia) => void;
  setJuzgado:  (juzgado: Juzgado) => void;
  setFecha:    (fecha: string) => void;
  setHora:     (hora: string) => void;
  setNotas:    (notas: string) => void;
  resetFlujo:  () => void;
}

const estadoInicial = {
  materia:  null,
  juzgado:  null,
  fecha:    '',
  hora:     '',
  notas:    '',
};

export const useAgendamientoStore = create<AgendamientoState>((set) => ({
  ...estadoInicial,

  setMateria: (materia) => set({ materia, juzgado: null, fecha: '', hora: '' }),
  setJuzgado: (juzgado) => set({ juzgado, fecha: '', hora: '' }),
  setFecha:   (fecha)   => set({ fecha, hora: '' }),
  setHora:    (hora)    => set({ hora }),
  setNotas:   (notas)   => set({ notas }),
  resetFlujo: ()        => set(estadoInicial),
}));
