// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { iniciarSesion } from '../../services/auth.service';
import { Colors, Spacing, Radius } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
      return;
    }
    try {
      setLoading(true);
      await iniciarSesion(email.trim().toLowerCase(), password);
      // El AppNavigator redirige automáticamente al detectar sesión activa
    } catch (e: any) {
      Alert.alert('Error de acceso', e.message ?? 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabecera institucional */}
      <View style={styles.header}>
        <Text style={styles.escudo}>🦅</Text>
        <Text style={styles.titulo}>CitasEdomex</Text>
        <Text style={styles.subtitulo}>Poder Judicial del Estado de México</Text>
      </View>

      {/* Franja tricolor */}
      <View style={styles.tricolor}>
        <View style={[styles.banda, { backgroundColor: Colors.danger }]} />
        <View style={[styles.banda, { backgroundColor: Colors.gold }]} />
        <View style={[styles.banda, { backgroundColor: Colors.primary }]} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.formTitle}>Accede a tu cuenta</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="usuario@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={Colors.textOnPrimary} />
            : <Text style={styles.btnPrimaryText}>Iniciar sesión</Text>
          }
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>¿No tienes cuenta?</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnOutlineText}>Registrarse</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Al ingresar aceptas los términos y condiciones del{'\n'}
          Poder Judicial del Estado de México
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.primary },
  header:     { alignItems: 'center', paddingVertical: Spacing.xl, paddingTop: Spacing.xxxl },
  escudo:     { fontSize: 52, marginBottom: Spacing.sm },
  titulo:     { fontSize: 26, fontWeight: '700', color: Colors.textOnPrimary },
  subtitulo:  { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  tricolor:   { flexDirection: 'row', height: 5 },
  banda:      { flex: 1 },
  form:       { backgroundColor: Colors.background, padding: Spacing.lg, flexGrow: 1 },
  formTitle:  { fontSize: 16, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.lg, marginTop: Spacing.sm, textAlign: 'center' },
  label:      { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 5 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: 14, color: Colors.textPrimary, backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  btnPrimary: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: 14, alignItems: 'center', marginTop: Spacing.sm,
  },
  btnPrimaryText: { color: Colors.textOnPrimary, fontSize: 15, fontWeight: '700' },
  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg, gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.textMuted },
  btnOutline: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.sm,
    paddingVertical: 13, alignItems: 'center',
  },
  btnOutlineText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
  legal:       { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 17 },
});
