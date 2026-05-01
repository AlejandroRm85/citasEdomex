// src/screens/perfil/PerfilScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { cerrarSesion } from '../../services/auth.service';
import { Colors, Spacing, Radius } from '../../theme/colors';

export default function PerfilScreen() {
  const { perfil } = useAuth();
  const [notifActiva, setNotifActiva] = useState(true);

  const iniciales = perfil?.nombre_completo
    ?.split(' ').slice(0, 2).map(n => n[0]).join('') ?? 'U';

  const tipoBadge = perfil?.tipo_usuario === 'abogado' ? '⚖️ Abogado' : '👤 Ciudadano';

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try { await cerrarSesion(); }
            catch (e: any) { Alert.alert('Error', e.message); }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{iniciales}</Text>
        </View>
        <Text style={styles.nombre}>{perfil?.nombre_completo ?? '—'}</Text>
        <Text style={styles.email}>Cédula: {perfil?.cedula_profesional ?? 'N/A'}</Text>
        <View style={styles.tipoBadge}>
          <Text style={styles.tipoBadgeText}>{tipoBadge}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Datos personales */}
        <Text style={styles.sectionTitle}>Información personal</Text>
        <View style={styles.section}>
          <FilaPerfil icono="📛" label="Nombre completo" valor={perfil?.nombre_completo ?? '—'} />
          <FilaPerfil icono="🪪" label="CURP"            valor={perfil?.curp ?? '—'} mono />
          <FilaPerfil icono="📱" label="Teléfono"        valor={perfil?.telefono ?? 'No registrado'} />
        </View>

        {/* Configuración */}
        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.section}>
          {/* Toggle notificaciones */}
          <View style={styles.filaSwitch}>
            <Text style={styles.filaSwitchIcon}>🔔</Text>
            <Text style={styles.filaSwitchLabel}>Notificaciones de citas</Text>
            <Switch
              value={notifActiva}
              onValueChange={setNotifActiva}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={notifActiva ? Colors.primary : Colors.textMuted}
            />
          </View>
          <FilaAccion icono="🔐" label="Cambiar contraseña" onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible en la siguiente versión.')} />
          <FilaAccion icono="❓" label="Ayuda y soporte"   onPress={() => Alert.alert('Soporte', 'Comunícate al: 800 PODER JUD')} />
          <FilaAccion icono="📄" label="Términos y condiciones" onPress={() => {}} ultimo />
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CitasEdomex v1.0.0{'\n'}Poder Judicial del Estado de México</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const FilaPerfil = ({ icono, label, valor, mono = false, ultimo = false }: { icono: string; label: string; valor: string; mono?: boolean; ultimo?: boolean }) => (
  <View style={[styles.fila, !ultimo && styles.filaBorder]}>
    <Text style={styles.filaIcono}>{icono}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.filaLabel}>{label}</Text>
      <Text style={[styles.filaValor, mono && { fontFamily: 'monospace', fontSize: 12 }]}>{valor}</Text>
    </View>
  </View>
);

const FilaAccion = ({ icono, label, onPress, ultimo = false }: { icono: string; label: string; onPress: () => void; ultimo?: boolean }) => (
  <TouchableOpacity style={[styles.fila, !ultimo && styles.filaBorder]} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.filaIcono}>{icono}</Text>
    <Text style={[styles.filaValor, { flex: 1 }]}>{label}</Text>
    <Text style={{ color: Colors.textMuted, fontSize: 18 }}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.primary },
  header:        { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg },
  avatarCircle:  { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarText:    { color: Colors.textOnPrimary, fontSize: 26, fontWeight: '700' },
  nombre:        { color: Colors.textOnPrimary, fontSize: 18, fontWeight: '700' },
  email:         { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  tipoBadge:     { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: Radius.full, marginTop: Spacing.sm },
  tipoBadgeText: { color: Colors.textOnPrimary, fontSize: 12, fontWeight: '600' },
  content:       { padding: Spacing.lg, backgroundColor: Colors.background, flexGrow: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  section:       { backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg, overflow: 'hidden' },
  fila:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  filaBorder:    { borderBottomWidth: 1, borderBottomColor: Colors.border },
  filaIcono:     { fontSize: 18, width: 26, textAlign: 'center' },
  filaLabel:     { fontSize: 11, color: Colors.textMuted },
  filaValor:     { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  filaSwitch:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filaSwitchIcon:{ fontSize: 18, width: 26, textAlign: 'center' },
  filaSwitchLabel:{ flex: 1, fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  btnLogout:     { borderWidth: 1.5, borderColor: Colors.danger, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginBottom: Spacing.md },
  btnLogoutText: { color: Colors.danger, fontSize: 14, fontWeight: '700' },
  version:       { textAlign: 'center', fontSize: 11, color: Colors.textMuted, lineHeight: 18, marginBottom: Spacing.lg },
});
