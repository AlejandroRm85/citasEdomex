// src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import HistorialScreen from '../screens/historial/HistorialScreen';
import PerfilScreen    from '../screens/perfil/PerfilScreen';
import { Colors } from '../theme/colors';

export type MainTabParamList = {
  Dashboard: undefined;
  Historial: undefined;
  Perfil:    undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const icon = (emoji: string, focused: boolean) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor:   Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarStyle: {
        borderTopWidth: 0.5,
        borderTopColor: Colors.border,
        height: 72,
        paddingBottom: 12,
        paddingTop: 8,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ focused }) => icon('🏠', focused) }}
    />
    <Tab.Screen
      name="Historial"
      component={HistorialScreen}
      options={{ tabBarLabel: 'Historial', tabBarIcon: ({ focused }) => icon('📋', focused) }}
    />
    <Tab.Screen
      name="Perfil"
      component={PerfilScreen}
      options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ focused }) => icon('👤', focused) }}
    />
  </Tab.Navigator>
);

// ────────────────────────────────────────────────────────────
// src/navigation/AgendamientoNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import MateriaScreen     from '../screens/agendamiento/MateriaScreen';
import JuzgadoScreen     from '../screens/agendamiento/JuzgadoScreen';
import FechaHoraScreen   from '../screens/agendamiento/FechaHoraScreen';
import ConfirmacionScreen from '../screens/agendamiento/ConfirmacionScreen';
import TicketScreen      from '../screens/agendamiento/TicketScreen';

export type AgendamientoStackParamList = {
  Materia:      undefined;
  Juzgado:      undefined;
  FechaHora:    undefined;
  Confirmacion: undefined;
  Ticket:       { citaId: string };
};

const AStack = createStackNavigator<AgendamientoStackParamList>();

export const AgendamientoNavigator = () => (
  <AStack.Navigator screenOptions={{ headerShown: false }}>
    <AStack.Screen name="Materia"      component={MateriaScreen} />
    <AStack.Screen name="Juzgado"      component={JuzgadoScreen} />
    <AStack.Screen name="FechaHora"    component={FechaHoraScreen} />
    <AStack.Screen name="Confirmacion" component={ConfirmacionScreen} />
    <AStack.Screen name="Ticket"       component={TicketScreen} />
  </AStack.Navigator>
);
