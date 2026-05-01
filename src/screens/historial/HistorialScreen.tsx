// src/screens/historial/HistorialScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useMisCitas } from '../../hooks/useCitas';
import { Cita, EstadoCita } from '../../services/supabase';
import { formatearHora } from '../../services/citas.service';
import { Colors, Spacing, Radius } from '../../theme/colors';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const FILTROS: { label: string; valor: EstadoCita | 'todas' }[] = [
  { label: 'Todas',       valor: 'todas' },
  { label: 'Programadas', valor: 'programada' },
  { label: 'Completadas', valor: 'completada' },
  { label: 'Canceladas',  valor: 'cancelada' },
];

export default function HistorialScreen() {
  const { citas, loading, recargar, cancelar } = useMisCitas();
  const [filtro, setFiltro] = useState<EstadoCita | 'todas'>('todas');

  const citasFiltradas = filtro === 'todas' ? citas : citas.filter(c => c.estado === filtro);

  const handleCancelar = (cita: Cita) => {
    Alert.alert(
      'Cancelar cita',
      `¿Deseas cancelar tu cita en ${cita.juzgados?.nombre ?? 'el juzgado'} el ${format(parseISO(cita.fecha_cita), "d 'de' MMMM", { locale: es })}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelar(cita.id);
              Alert.alert('Cita cancelada', 'Tu cita ha sido cancelada correctamente.');
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Citas</Text>
        <Text style={styles.headerSub}>{citas.length} trámites en total</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
          {FILTROS.map(f => (
            <TouchableOpacity
              key={f.valor}
              style={[styles.filtroBtn, filtro === f.valor && styles.filtroBtnActive]}
              onPress={() => setFiltro(f.valor)}
            >
              <Text style={[styles.filtroBtnText, filtro === f.valor && styles.filtroBtnTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={recargar} tintColor={Colors.primary} />}
      >
        {!loading && citasFiltradas.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 40, marginBottom: Spacing.sm }}>📋</Text>
            <Text style={styles.emptyTitle}>Sin citas en esta categoría</Text>
          </View>
        )}

        {citasFiltradas.map(cita => (
          <CitaHistorialCard
            key={cita.id}
            cita={cita}
            onCancelar={() => handleCancelar(cita)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const BADGE_CONFIG: Record<EstadoCita, { bg: string; color: string; label: string }> = {
  programada:  { bg: Colors.primaryPale, color: Colors.primary,   label: 'Programada' },
  completada:  { bg: '#E3F2FD',          color: '#1565C0',         label: 'Completada' },
  cancelada:   { bg: '#FFEBEE',          color: Colors.danger,     label: 'Cancelada'  },
};

const CitaHistorialCard = ({ cita, onCancelar }: { cita: Cita; onCancelar: () => void }) => {
  const badge = BADGE_CONFIG[cita.estado];
  const juzgado = cita.juzgados;
  const fecha = format(parseISO(cita.fecha_cita), "d 'de' MMMM yyyy", { locale: es });
  const esProgramada = cita.estado === 'programada';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{juzgado?.nombre ?? 'Juzgado'}</Text>
          <Text style={styles.cardSub}>{fecha} — {formatearHora(cita.hora_cita)}</Text>
          <Text style={styles.cardMuni}>📍 {juzgado?.municipio ?? ''}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      {esProgramada && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.btnVer} onPress={() => {}}>
            <Text style={styles.btnVerText}>Ver ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
            <Text style={styles.btnCancelarText}>Cancelar cita</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: Colors.primary },
  header:          { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, paddingTop: Spacing.sm },
  headerTitle:     { color: Colors.textOnPrimary, fontSize: 20, fontWeight: '700' },
  headerSub:       { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 3 },
  filtrosWrap:     { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filtros:         { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm },
  filtroBtn:       { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  filtroBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filtroBtnText:   { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filtroBtnTextActive: { color: Colors.textOnPrimary },
  content:         { padding: Spacing.lg, backgroundColor: Colors.background, flexGrow: 1 },
  emptyCard:       { alignItems: 'center', padding: Spacing.xxxl, marginTop: Spacing.xl },
  emptyTitle:      { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  card:            { backgroundColor: Colors.surface, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, marginBottom: Spacing.sm },
  cardTop:         { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  cardTitle:       { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  cardSub:         { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  cardMuni:        { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  badge:           { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full, alignSelf: 'flex-start', flexShrink: 0 },
  badgeText:       { fontSize: 11, fontWeight: '600' },
  cardActions:     { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  btnVer:          { flex: 1, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center' },
  btnVerText:      { fontSize: 12, fontWeight: '700', color: Colors.primary },
  btnCancelar:     { flex: 1, borderWidth: 1.5, borderColor: Colors.danger, borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center' },
  btnCancelarText: { fontSize: 12, fontWeight: '700', color: Colors.danger },
});
