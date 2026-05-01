// src/screens/agendamiento/TicketScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { AgendamientoStackParamList } from '../../navigation/MainNavigator';
import { getCitaById, formatearHora } from '../../services/citas.service';
import { useAgendamientoStore } from '../../store/agendamiento.store';
import { Cita } from '../../services/supabase';
import { Colors, Spacing, Radius } from '../../theme/colors';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type Props = {
  navigation: StackNavigationProp<AgendamientoStackParamList, 'Ticket'>;
  route:      RouteProp<AgendamientoStackParamList, 'Ticket'>;
};

export default function TicketScreen({ navigation, route }: Props) {
  const { citaId } = route.params;
  const [cita,    setCita]    = useState<Cita | null>(null);
  const [loading, setLoading] = useState(true);
  const resetFlujo = useAgendamientoStore(s => s.resetFlujo);

  useEffect(() => {
    getCitaById(citaId)
      .then(setCita)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [citaId]);

  const handleCompartir = async () => {
    if (!cita) return;
    const juzgado = cita.juzgados;
    const msg = `CitasEdomex — Ticket de cita\n\nJuzgado: ${juzgado?.nombre}\nFecha: ${format(parseISO(cita.fecha_cita), "d 'de' MMMM yyyy", { locale: es })}\nHora: ${formatearHora(cita.hora_cita)}\nID: ${cita.qr_token}`;
    await Share.share({ message: msg });
  };

  const handleIrInicio = () => {
    resetFlujo();
    // Navegar al tab principal
    navigation.getParent()?.navigate('Main');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.textOnPrimary} />
      </SafeAreaView>
    );
  }

  const juzgado = cita?.juzgados;
  const qrData  = `CITASEDOMEX:${cita?.qr_token ?? ''}`;
  const fechaFormateada = cita?.fecha_cita
    ? format(parseISO(cita.fecha_cita), "d 'de' MMMM yyyy", { locale: es })
    : '';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar sin regresar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleIrInicio} style={styles.cerrarBtn}>
          <Text style={styles.cerrarIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Ticket Digital</Text>
        <TouchableOpacity onPress={handleCompartir}>
          <Text style={styles.shareIcon}>⬆️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ícono de éxito */}
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>¡Cita confirmada!</Text>
        <Text style={styles.successSub}>
          Presenta este ticket al ingresar al juzgado. El personal escaneará el código QR.
        </Text>

        {/* Ticket */}
        <View style={styles.ticket}>
          {/* Cabecera */}
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketHeaderTitle}>🏛️  Poder Judicial — Edomex</Text>
            <Text style={styles.ticketHeaderSub}>Ticket de acceso digital — No transferible</Text>
          </View>

          {/* Cuerpo */}
          <View style={styles.ticketBody}>
            {/* QR */}
            <View style={styles.qrWrap}>
              <QRCode
                value={qrData}
                size={140}
                color={Colors.primary}
                backgroundColor={Colors.surface}
              />
            </View>
            <Text style={styles.qrId} numberOfLines={1}>
              ID: {cita?.qr_token?.split('-')[0].toUpperCase()}···
            </Text>

            {/* Datos */}
            <View style={styles.datosGrid}>
              <FilaTicket clave="Juzgado"   valor={juzgado?.nombre ?? '—'} />
              <FilaTicket clave="Municipio" valor={juzgado?.municipio ?? '—'} />
              <FilaTicket clave="Fecha"     valor={fechaFormateada} />
              <FilaTicket clave="Hora"      valor={cita ? formatearHora(cita.hora_cita) : '—'} />
              <FilaTicket clave="Estado"    valor="✓ Programada" verde />
            </View>
          </View>

          {/* Pie */}
          <View style={styles.ticketFooter}>
            <Text style={styles.ticketFooterText}>
              Válido únicamente para la fecha y hora indicadas
            </Text>
          </View>
        </View>

        {/* Acciones */}
        <TouchableOpacity style={styles.btnCompartir} onPress={handleCompartir} activeOpacity={0.85}>
          <Text style={styles.btnCompartirText}>⬆️  Compartir ticket</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnInicio} onPress={handleIrInicio} activeOpacity={0.85}>
          <Text style={styles.btnInicioText}>Ir al inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const FilaTicket = ({ clave, valor, verde = false }: { clave: string; valor: string; verde?: boolean }) => (
  <View style={styles.filaTicket}>
    <Text style={styles.filaTicketClave}>{clave}</Text>
    <Text style={[styles.filaTicketValor, verde && { color: Colors.primary }]}>{valor}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Colors.primary },
  topBar:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
  cerrarBtn:       { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  cerrarIcon:      { color: Colors.textOnPrimary, fontSize: 16 },
  topTitle:        { color: Colors.textOnPrimary, fontSize: 17, fontWeight: '700' },
  shareIcon:       { fontSize: 22 },
  content:         { padding: Spacing.lg, backgroundColor: Colors.background, flexGrow: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  successIcon:     { fontSize: 56, textAlign: 'center', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  successTitle:    { fontSize: 20, fontWeight: '700', color: Colors.primary, textAlign: 'center', marginBottom: Spacing.sm },
  successSub:      { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 19 },
  ticket:          { borderWidth: 2, borderColor: Colors.primary, borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.lg, borderStyle: 'dashed' },
  ticketHeader:    { backgroundColor: Colors.primary, padding: Spacing.md },
  ticketHeaderTitle:{ color: Colors.textOnPrimary, fontSize: 14, fontWeight: '700' },
  ticketHeaderSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  ticketBody:      { padding: Spacing.lg, backgroundColor: Colors.surface },
  qrWrap:          { alignItems: 'center', marginBottom: Spacing.sm },
  qrId:            { textAlign: 'center', fontSize: 11, color: Colors.textMuted, fontFamily: 'monospace', marginBottom: Spacing.md },
  datosGrid:       { gap: 0 },
  filaTicket:      { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filaTicketClave: { fontSize: 12, color: Colors.textMuted, width: 90 },
  filaTicketValor: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  ticketFooter:    { backgroundColor: Colors.primaryPale, padding: Spacing.md, alignItems: 'center' },
  ticketFooterText:{ fontSize: 11, color: Colors.primary, fontWeight: '600' },
  btnCompartir:    { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.sm },
  btnCompartirText:{ color: Colors.textOnPrimary, fontSize: 15, fontWeight: '700' },
  btnInicio:       { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 13, alignItems: 'center' },
  btnInicioText:   { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
