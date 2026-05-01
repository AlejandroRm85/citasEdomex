// src/screens/agendamiento/ConfirmacionScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AgendamientoStackParamList } from '../../navigation/MainNavigator';
import { useAgendamientoStore } from '../../store/agendamiento.store';
import { agendarCita, formatearHora } from '../../services/citas.service';
import { Colors, Spacing, Radius } from '../../theme/colors';
import { PasoIndicador } from '../../components/PasoIndicador';
import { TopBar } from '../../components/TopBar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Props = { navigation: StackNavigationProp<AgendamientoStackParamList, 'Confirmacion'> };

export default function ConfirmacionScreen({ navigation }: Props) {
  const { materia, juzgado, fecha, hora, notas, resetFlujo } = useAgendamientoStore();
  const [loading, setLoading] = useState(false);

  const fechaFormateada = fecha
    ? format(new Date(fecha + 'T12:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })
    : '';

  const handleConfirmar = async () => {
    if (!juzgado || !fecha || !hora) return;
    try {
      setLoading(true);
      const cita = await agendarCita({
        juzgado_id: juzgado.id,
        fecha_cita: fecha,
        hora_cita:  hora + ':00',
        notas:      notas || undefined,
      });
      navigation.navigate('Ticket', { citaId: cita.id });
      // No reseteamos aquí para que Ticket pueda leer el store si necesita
    } catch (e: any) {
      Alert.alert('No se pudo agendar', e.message ?? 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Confirmar Cita" subtitulo="Paso 4 de 4 — Revisa los detalles" onBack={() => navigation.goBack()} />
      <PasoIndicador paso={4} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner informativo */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>✅  Verifica que todos los datos sean correctos antes de confirmar.</Text>
        </View>

        <Text style={styles.sectionTitle}>Resumen de cita</Text>
        <View style={styles.card}>
          <FilaDato label="Materia"   valor={materia?.nombre ?? '—'} />
          <FilaDato label="Juzgado"   valor={juzgado?.nombre ?? '—'} />
          <FilaDato label="Municipio" valor={juzgado ? `${juzgado.municipio}, Edomex` : '—'} />
          <FilaDato label="Fecha"     valor={fechaFormateada} ultimo={false} />
          <FilaDato label="Hora"      valor={hora ? formatearHora(hora + ':00') : '—'} ultimo />
        </View>

        {/* Advertencia */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            ⚠️  Deberás presentarte puntualmente con identificación oficial vigente.
            La cancelación debe realizarse con al menos 24 horas de anticipación.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.btnConfirmar, loading && { opacity: 0.7 }]}
          onPress={handleConfirmar}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.textOnPrimary} />
            : <Text style={styles.btnConfirmarText}>Confirmar y obtener ticket</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnModificar}
          onPress={() => navigation.navigate('Materia')}
          disabled={loading}
        >
          <Text style={styles.btnModificarText}>Modificar datos</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const FilaDato = ({ label, valor, ultimo = false }: { label: string; valor: string; ultimo?: boolean }) => (
  <View style={[styles.fila, !ultimo && styles.filaBorder]}>
    <Text style={styles.filaLabel}>{label}</Text>
    <Text style={styles.filaValor}>{valor}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.primary },
  content:        { padding: Spacing.lg, backgroundColor: Colors.background, flexGrow: 1 },
  infoBanner:     { backgroundColor: Colors.primaryPale, borderWidth: 1, borderColor: Colors.primary, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: Spacing.lg },
  infoText:       { fontSize: 13, color: Colors.primary, fontWeight: '500', lineHeight: 19 },
  sectionTitle:   { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  card:           { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.lg },
  fila:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10 },
  filaBorder:     { borderBottomWidth: 1, borderBottomColor: Colors.border },
  filaLabel:      { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  filaValor:      { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, flex: 2, textAlign: 'right' },
  alertBanner:    { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: Colors.danger, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: Spacing.lg },
  alertText:      { fontSize: 12, color: Colors.danger, lineHeight: 18 },
  btnConfirmar:   { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.sm },
  btnConfirmarText:{ color: Colors.textOnPrimary, fontSize: 15, fontWeight: '700' },
  btnModificar:   { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 13, alignItems: 'center' },
  btnModificarText:{ color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
