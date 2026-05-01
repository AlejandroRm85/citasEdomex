// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AgendamientoNavigator } from './AgendamientoNavigator';
import { Colors } from '../theme/colors';

export type RootStackParamList = {
  Auth:         undefined;
  Main:         undefined;
  Agendamiento: undefined;
  Ticket:       { citaId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator size="large" color={Colors.textOnPrimary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main"         component={MainNavigator} />
            <Stack.Screen name="Agendamiento" component={AgendamientoNavigator} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
