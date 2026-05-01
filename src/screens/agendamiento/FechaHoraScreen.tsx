// src/screens/agendamiento/FechaHoraScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AgendamientoStackParamList } from '../../navigation/MainNavigator';
import { useAgendamientoStore } from '../../store/agendamiento.store';
import { getHorariosOcupados, HORARIOS_DISPONIBLES, formatearHora } from '../../services/citas.service';
import { Colors, Spacing, Radius } from '../../theme/colors';
import { PasoIndicador } from '../../components/PasoIndicador';
import { TopBar } from '../../components/TopBar';
import { format, addDays, startOfDay, getDay, addMonths, subMonths, startOfMonth, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';

type Props = { navigation: StackNavigationProp<AgendamientoStackParamList, 'FechaHora'> };

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export default function FechaHoraScreen({ navigation }: Props) {
  const { juzgado, fecha, hora, setFecha, setHora } = useAgendamientoStore();

  const [mesBase,       setMesBase]       = useState(new Date());
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [loadingHoras,  setLoadingHoras]  = useState(false);

  // Cargar horarios ocupados cuando se selecciona fecha
  useEffect(() => {
    if (!fecha || !juzgado) return;
    setLoadingHoras(true);
    getHorariosOcupados(juzgado.id, fecha)
      .then(setHorasOcupadas)
      .catch(console.error)
      .finally(() => setLoadingHoras(false));
  }, [fecha, juzgado]);

  const hoy = startOfDay(new Date());
  const primerDiaMes = startOfMonth(mesBase);
  // En JS, getDay(): 0=Dom,1=Lun…6=Sab → convertir a Lu=0
  const offsetInicio = (getDay(primerDiaMes) + 6) % 7;
  const diasEnMes = getDaysInMonth(mesBase);

  const handleDia = (dia: number) => {
    const fecha_ = new Date(mesBase.getFullYear(), mesBase.getMonth(), dia);
    if (fecha_ < hoy) return;
    const diaSemana = getDay(fecha_); // 0=Dom, 6=Sab
    if (diaSemana === 0 || diaSemana === 6) return; // sin fines de semana
    setFecha(format(fecha_, 'yyyy-MM-dd'));
    setHora('');
  };

  const esDiaSeleccionado = (dia: number) => {
    if (!fecha) return false;
    return fecha === format(new Date(mesBase.getFullYear(), mesBase.getMonth(), dia), 'yyyy-MM-dd');
  };

  const esDiaDeshabilitado = (dia: number) => {
    const d = new Date(mesBase.getFullYear(), mesBase.getMonth(), dia);
    const ds = getDay(d);
    return d < hoy || ds === 0 || ds === 6;
  };

  const mesLabel = format(mesBase, 'MMMM yyyy', { locale: es });

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Fecha y Horario" subtitulo="Paso 3 de 4 — Elige día y hora" onBack={() => navigation.goBack()} />
      <PasoIndicador paso={3} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Calendario */}
        <View style={styles.card}>
          {/* Navegación mes */}
          <View style={styles.mesNav}>
            <TouchableOpacity onPress={() => setMesBase(subMonths(mesBase, 1))} style={styles.mesBtn}>
              <Text style={styles.mesBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.mesLabel}>{mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1)}</Text>
            <TouchableOpacity onPress={() => setMesBase(addMonths(mesBase, 1))} style={styles.mesBtn}>
              <Text style={styles.mesBtnText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Encabezados días */}
          <View style={styles.calGrid}>
            {DIAS_SEMANA.map(d => (
              <Text key={d} style={styles.calHeader}>{d}</Text>
            ))}

            {/* Celdas vacías de offset */}
            {Array.from({ length: offsetInicio }).map((_, i) => (
              <View key={`e${i}`} style={styles.calCell} />
            ))}

            {/* Días del mes */}
            {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => {
              const deshabilitado = esDiaDeshabilitado(dia);
              const seleccionado  = esDiaSeleccionado(dia);
              return (
                <TouchableOpacity
                  key={dia}
                  style={[styles.calCell, seleccionado && styles.calCellSelected, deshabilitado && styles.calCellDisabled]}
                  onPress={() => !deshabilitado && handleDia(dia)}
                  activeOpacity={deshabilitado ? 1 : 0.7}
                >
                  <Text style={[styles.calDia, seleccionado && styles.calDiaSelected, deshabilitado && styles.calDiaDisabled]}>
                    {dia}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Horarios */}
        {fecha && (
          <>
            <Text style={styles.sectionTitle}>
              Horarios disponibles —{' '}
              <Text style={{ color: Colors.primary }}>
                {format(new Date(fecha + 'T12:00:00'), "d 'de' MMMM", { locale: es })}
              </Text>
            </Text>

            {loadingHoras
              ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
              : (
                <View style={styles.horariosGrid}>
                  {HORARIOS_DISPONIBLES.map(h => {
                    const ocupado    = horasOcupadas.includes(h);
                    const seleccionado = hora === h;
                    return (
                      <TouchableOpacity
                        key={h}
                        style={[styles.slot, seleccionado && styles.slotSelected, ocupado && styles.slotOcupado]}
                        onPress={() => !ocupado && setHora(h)}
                        activeOpacity={ocupado ? 1 : 0.75}
                        disabled={ocupado}
                      >
                        <Text style={[styles.slotText, seleccionado && styles.slotTextSelected, ocupado && styles.slotTextOcupado]}>
                          {formatearHora(h + ':00')}
                        </Text>
                        {ocupado && <Text style={styles.slotOcupadoLabel}>Ocupado</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )
            }
          </>
        )}

        <TouchableOpacity
          style={[styles.btnNext, (!fecha || !hora) && { opacity: 0.4 }]}
          onPress={() => navigation.navigate('Confirmacion')}
          disabled={!fecha || !hora}
        >
          <Text style={styles.btnNextText}>Continuar →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.primary },
  content:       { padding: Spacing.lg, backgroundColor: Colors.background, flexGrow: 1 },
  card:          { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.lg },
  mesNav:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  mesBtn:        { borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4 },
  mesBtnText:    { fontSize: 18, color: Colors.textPrimary, lineHeight: 24 },
  mesLabel:      { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  calGrid:       { flexDirection: 'row', flexWrap: 'wrap' },
  calHeader:     { width: '14.28%', textAlign: 'center', fontSize: 11, fontWeight: '700', color: Colors.textMuted, paddingVertical: 4 },
  calCell:       { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  calCellSelected: { backgroundColor: Colors.primary, borderRadius: 8 },
  calCellDisabled: {},
  calDia:        { fontSize: 13, color: Colors.textPrimary },
  calDiaSelected:{ color: Colors.textOnPrimary, fontWeight: '700' },
  calDiaDisabled:{ color: Colors.border },
  sectionTitle:  { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  horariosGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  slot:          { width: '30.5%', borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.sm, paddingVertical: 11, alignItems: 'center', backgroundColor: Colors.surface },
  slotSelected:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotOcupado:   { backgroundColor: '#F5F5F5', borderColor: Colors.border },
  slotText:      { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  slotTextSelected: { color: Colors.textOnPrimary },
  slotTextOcupado:  { color: Colors.textMuted, fontSize: 12 },
  slotOcupadoLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 2 },
  btnNext:       { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm },
  btnNextText:   { color: Colors.textOnPrimary, fontSize: 15, fontWeight: '700' },
});
