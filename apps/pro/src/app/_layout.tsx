import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';

export default function RootLayout() {
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
