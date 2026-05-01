// src/screens/agendamiento/MateriaScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AgendamientoStackParamList } from '../../navigation/MainNavigator';
import { useAgendamientoStore } from '../../store/agendamiento.store';
import { getMaterias } from '../../services/materias.service';
import { Materia } from '../../services/supabase';
import { Colors, Spacing, Radius } from '../../theme/colors';
import { PasoIndicador } from '../../components/PasoIndicador';
import { TopBar } from '../../components/TopBar';

type Props = { navigation: StackNavigationProp<AgendamientoStackParamList, 'Materia'> };

export default function MateriaScreen({ navigation }: Props) {
  const { materia: seleccionada, setMateria } = useAgendamientoStore();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getMaterias().then(data => { setMaterias(data); setLoading(false); });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar titulo="Agendar Cita" subtitulo="Paso 1 de 4 — Selecciona la materia" onBack={() => navigation.goBack()} />
      <PasoIndicador paso={1} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>ℹ️  Selecciona el tipo de materia para filtrar los juzgados disponibles.</Text>
        </View>
        {loading ? <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} /> : (
          <View style={styles.grid}>
            {materias.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.card, seleccionada?.id === m.id && styles.cardSelected]}
                onPress={() => setMateria(m)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardIcon}>{m.icono}</Text>
                <Text style={styles.cardName}>{m.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={[styles.btnNext, !seleccionada && { opacity: 0.4 }]}
          onPress={() => navigation.navigate('Juzgado')}
          disabled={!seleccionada}
        >
          <Text style={styles.btnNextText}>Continuar →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.primary },
  content:      { padding: Spacing.lg, backgroundColor: Colors.background, flexGrow: 1 },
  infoBanner:   { backgroundColor: Colors.primaryPale, borderWidth: 1, borderColor: Colors.primary, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: Spacing.lg },
  infoText:     { fontSize: 13, color: Colors.primary, fontWeight: '500', lineHeight: 19 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  card:         { width: '48%', backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center' },
  cardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryPale },
  cardIcon:     { fontSize: 32, marginBottom: Spacing.sm },
  cardName:     { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  btnNext:      { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm },
  btnNextText:  { color: Colors.textOnPrimary, fontSize: 15, fontWeight: '700' },
});
