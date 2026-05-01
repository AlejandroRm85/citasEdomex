// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { registrarUsuario } from '../../services/auth.service';
import { Colors, Spacing, Radius } from '../../theme/colors';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { TipoUsuario } from '../../services/supabase';

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState({
    nombre_completo:     '',
    curp:                '',
    email:               '',
    telefono:            '',
    password:            '',
    confirmPassword:     '',
    tipo_usuario:        'ciudadano' as TipoUsuario,
    cedula_profesional:  '',
  });
  const [loading, setLoading] = useState(false);

  const campo = (key: keyof typeof form) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleRegistro = async () => {
    if (!form.nombre_completo || !form.curp || !form.email || !form.password) {
      Alert.alert('Campos requeridos', 'Completa todos los campos obligatorios.');
      return;
    }
    if (form.curp.length !== 18) {
      Alert.alert('CURP inválida', 'La CURP debe tener exactamente 18 caracteres.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales.');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      setLoading(true);
      await registrarUsuario({
        email:           form.email.trim().toLowerCase(),
        password:        form.password,
        nombre_completo: form.nombre_completo.trim(),
        curp:            form.curp.trim().toUpperCase(),
        telefono:        form.telefono || undefined,
        tipo_usuario:    form.tipo_usuario,
        cedula_profesional: form.tipo_usuario === 'abogado' ? form.cedula_profesional : undefined,
      });
      Alert.alert(
        '¡Registro exitoso!',
        'Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.',
        [{ text: 'Ir al login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e: any) {
      Alert.alert('Error de registro', e.message ?? 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Nuevo registro</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

        <Campo label="Nombre completo *" value={form.nombre_completo} onChange={campo('nombre_completo')} placeholder="Como aparece en tu INE" />
        <Campo label="CURP *" value={form.curp} onChange={(v) => campo('curp')(v.toUpperCase())} placeholder="18 caracteres" maxLength={18} autoCapitalize="characters" />
        <Campo label="Correo electrónico *" value={form.email} onChange={campo('email')} placeholder="usuario@email.com" keyboardType="email-address" />
        <Campo label="Teléfono" value={form.telefono} onChange={campo('telefono')} placeholder="722 000 0000" keyboardType="phone-pad" />

        {/* Tipo de usuario */}
        <Text style={styles.label}>Tipo de usuario *</Text>
        <View style={styles.tipoRow}>
          {(['ciudadano', 'abogado'] as TipoUsuario[]).map(tipo => (
            <TouchableOpacity
              key={tipo}
              style={[styles.tipoBtn, form.tipo_usuario === tipo && styles.tipoBtnActive]}
              onPress={() => setForm(p => ({ ...p, tipo_usuario: tipo }))}
            >
              <Text style={[styles.tipoBtnText, form.tipo_usuario === tipo && styles.tipoBtnTextActive]}>
                {tipo === 'ciudadano' ? '👤 Ciudadano' : '⚖️ Abogado'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {form.tipo_usuario === 'abogado' && (
          <Campo label="Cédula profesional" value={form.cedula_profesional} onChange={campo('cedula_profesional')} placeholder="Número de cédula SEP" />
        )}

        <Campo label="Contraseña *" value={form.password} onChange={campo('password')} placeholder="Mínimo 8 caracteres" secureTextEntry />
        <Campo label="Confirmar contraseña *" value={form.confirmPassword} onChange={campo('confirmPassword')} placeholder="Repite tu contraseña" secureTextEntry />

        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
          onPress={handleRegistro}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.textOnPrimary} />
            : <Text style={styles.btnText}>Crear cuenta</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente campo reutilizable
const Campo = ({ label, value, onChange, placeholder, secureTextEntry = false, keyboardType = 'default', maxLength, autoCapitalize = 'none' }: any) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize={autoCapitalize}
      placeholderTextColor={Colors.textMuted}
    />
  </>
);

const styles = StyleSheet.create({
  topBar:    { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  backBtn:   { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backIcon:  { color: Colors.textOnPrimary, fontSize: 22, lineHeight: 26 },
  topTitle:  { color: Colors.textOnPrimary, fontSize: 17, fontWeight: '700' },
  scroll:    { backgroundColor: Colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  form:      { padding: Spacing.lg, paddingBottom: 40 },
  label:     { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 5, marginTop: 2 },
  input:     { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 14, color: Colors.textPrimary, backgroundColor: Colors.surface, marginBottom: Spacing.md },
  tipoRow:   { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  tipoBtn:   { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.sm, paddingVertical: 11, alignItems: 'center', backgroundColor: Colors.surface },
  tipoBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryPale },
  tipoBtnText:   { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tipoBtnTextActive: { color: Colors.primary },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.md },
  btnText:   { color: Colors.textOnPrimary, fontSize: 15, fontWeight: '700' },
});
