import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

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
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="plans" options={{ title: 'Escolha seu Plano', headerBackTitle: 'Voltar' }} />
        <Stack.Screen name="payment-status" options={{ title: 'Pagamento', headerBackTitle: 'Voltar' }} />
        <Stack.Screen
          name="student/[id]"
          options={{
            title: 'Aluno',
            headerBackTitle: 'Voltar',
          }}
        />
        <Stack.Screen
          name="workout/[id]"
          options={{ title: 'Treino', headerBackTitle: 'Voltar' }}
        />
      </Stack>
    </>
  );
}
