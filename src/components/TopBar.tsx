// src/components/TopBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme/colors';

interface TopBarProps {
  titulo:    string;
  subtitulo?: string;
  onBack?:   () => void;
}

export const TopBar = ({ titulo, subtitulo, onBack }: TopBarProps) => (
  <View style={styles.container}>
    <View style={styles.row}>
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.titulo}>{titulo}</Text>
        {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container:  { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  row:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn:    { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  backIcon:   { color: Colors.textOnPrimary, fontSize: 24, lineHeight: 28 },
  titulo:     { color: Colors.textOnPrimary, fontSize: 16, fontWeight: '700' },
  subtitulo:  { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
});
