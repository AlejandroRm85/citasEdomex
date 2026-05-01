// src/screens/dashboard/DashboardScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../hooks/useAuth';
import { useCitasProximas } from '../../hooks/useCitas';
import { Colors, Spacing, Radius } from '../../theme/colors';
import { Cita } from '../../services/supabase';
import { formatearHora } from '../../services/citas.service';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { perfil } = useAuth();
  const { citas, loading, recargar } = useCitasProximas(3);

  const primerNombre = perfil?.nombre_completo?.split(' ')[0] ?? 'Usuario';
  const iniciales = perfil?.nombre_completo
    ?.split(' ').slice(0, 2).map(n => n[0]).join('') ?? 'U';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Hero verde */}
      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroGreet}>Bienvenido,</Text>
            <Text style={styles.heroName}>{primerNombre}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciales}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.btnNuevaCita}
          onPress={() => navigation.navigate('Agendamiento')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnNuevaCitaIcon}>📅</Text>
          <Text style={styles.btnNuevaCitaText}>Agendar Nueva Cita</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={recargar} tintColor={Colors.primary} />}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard numero={citas.length} label="Citas próximas" />
          <StatCard numero={perfil?.tipo_usuario === 'abogado' ? 'Abg.' : 'Cte.'} label="Tipo de usuario" />
        </View>

        {/* Próximas citas */}
        <Text style={styles.sectionTitle}>Próximas citas</Text>
        {loading && <Text style={styles.emptyText}>Cargando...</Text>}
        {!loading && citas.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No tienes citas próximas</Text>
            <Text style={styles.emptySub}>Agenda tu primera cita con el botón de arriba</Text>
          </View>
        )}
        {citas.map(cita => <CitaCard key={cita.id} cita={cita} onPress={() => navigation.navigate('Agendamiento', { screen: 'Ticket', params: { citaId: cita.id } })} />)}

        {/* Accesos rápidos */}
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.quickRow}>
          <QuickCard emoji="📋" label="Mi historial" onPress={() => {}} />
          <QuickCard emoji="🗺️" label="Juzgados" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ numero, label }: { numero: any; label: string }) => (
  <View style={styles.statCard}>
    <Text style={styles.statNum}>{numero}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const CitaCard = ({ cita, onPress }: { cita: Cita; onPress: () => void }) => {
  const juzgado = cita.juzgados;
  const fecha = format(parseISO(cita.fecha_cita), "d 'de' MMMM", { locale: es });

  return (
    <TouchableOpacity style={styles.citaCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.citaRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.citaNombre}>{juzgado?.nombre ?? 'Juzgado'}</Text>
          <Text style={styles.citaLoc}>📍 {juzgado?.municipio ?? ''}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: Colors.primaryPale }]}>
          <Text style={[styles.badgeText, { color: Colors.primary }]}>Programada</Text>
        </View>
      </View>
      <View style={styles.citaMeta}>
        <Text style={styles.citaMetaText}>📅 {fecha}</Text>
        <Text style={styles.citaMetaText}>🕙 {formatearHora(cita.hora_cita)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const QuickCard = ({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.quickCard} onPress={onPress} activeOpacity={0.8}>
    <Text style={{ fontSize: 28 }}>{emoji}</Text>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: Colors.primary },
  hero:     { backgroundColor: Colors.primary, padding: Spacing.lg, paddingBottom: Spacing.xl },
  heroRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroGreet:{ color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  heroName: { color: Colors.textOnPrimary, fontSize: 18, fontWeight: '700', marginTop: 2 },
  avatar:   { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText:{ color: Colors.textOnPrimary, fontWeight: '700', fontSize: 15 },
  btnNuevaCita:{ backgroundColor: Colors.gold, borderRadius: Radius.md, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.lg },
  btnNuevaCitaIcon: { fontSize: 20 },
  btnNuevaCitaText: { color: '#1A1A00', fontSize: 15, fontWeight: '700' },
  scroll:   { backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  content:  { padding: Spacing.lg, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, marginTop: Spacing.sm },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center' },
  statNum:  { fontSize: 26, fontWeight: '700', color: Colors.primary },
  statLabel:{ fontSize: 11, color: Colors.textSecondary, marginTop: 3, textAlign: 'center' },
  sectionTitle:{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  citaCard: { backgroundColor: Colors.surface, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 4, borderLeftColor: Colors.primary, padding: Spacing.md, marginBottom: Spacing.sm },
  citaRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  citaNombre:{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  citaLoc:  { fontSize: 11, color: Colors.textSecondary, marginTop: 3 },
  citaMeta: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm },
  citaMetaText: { fontSize: 12, color: Colors.textSecondary },
  badge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  badgeText:{ fontSize: 11, fontWeight: '600' },
  emptyCard:{ backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  emptyIcon:{ fontSize: 36, marginBottom: Spacing.sm },
  emptyText:{ fontSize: 14, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  emptySub: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
  quickRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  quickCard:{ flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center', gap: 6 },
  quickLabel:{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
});
