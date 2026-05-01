// src/components/PasoIndicador.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme/colors';

interface PasoIndicadorProps {
  paso:  number; // 1–4
  total?: number;
}

export const PasoIndicador = ({ paso, total = 4 }: PasoIndicadorProps) => (
  <View style={styles.container}>
    {Array.from({ length: total }, (_, i) => {
      const num      = i + 1;
      const hecho    = num < paso;
      const activo   = num === paso;
      const pendiente= num > paso;

      return (
        <React.Fragment key={num}>
          <View style={[styles.dot, hecho && styles.dotHecho, activo && styles.dotActivo, pendiente && styles.dotPendiente]}>
            <Text style={[styles.dotText, (hecho || activo) && styles.dotTextActivo]}>
              {hecho ? '✓' : num}
            </Text>
          </View>
          {num < total && (
            <View style={[styles.linea, hecho && styles.lineaHecha]} />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container:      { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dot:            { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dotHecho:       { backgroundColor: Colors.primary },
  dotActivo:      { backgroundColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  dotPendiente:   { backgroundColor: Colors.border },
  dotText:        { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  dotTextActivo:  { color: Colors.textOnPrimary },
  linea:          { flex: 1, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  lineaHecha:     { backgroundColor: Colors.primary },
});
