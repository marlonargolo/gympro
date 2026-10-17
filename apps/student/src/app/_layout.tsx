import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { StoreProvider } from '../context/StoreContext';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('access_token').then((token) => {
      if (!token) {
        router.replace('/login');
      }
    });
  }, []);

  return (
    <StoreProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.primary,
          headerTitleStyle: { color: Colors.text },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="plans" options={{ title: 'Escolha seu Plano', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name="payment-status" options={{ title: 'Pagamento', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name="find-professionals" options={{ title: 'Encontrar Profissionais', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name="workout/[id]" options={{ title: 'Treino', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name="training-methods" options={{ title: 'Métodos de treino' }} />
        <Stack.Screen name="health-calculators" options={{ title: 'Calculadoras de Saúde' }} />
        <Stack.Screen name="marketplace" options={{ title: 'Parceiros' }} />
        <Stack.Screen name="maps" options={{ title: 'Profissionais e Academias' }} />
        <Stack.Screen name="music" options={{ title: 'Música' }} />
        <Stack.Screen name="sleep" options={{ title: 'Sono & Relógio' }} />
        <Stack.Screen name="nutritionists" options={{ title: 'Nutricionistas' }} />
      </Stack>
    </StoreProvider>
  );
}
