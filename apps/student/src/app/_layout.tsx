import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import { StoreProvider } from '../context/StoreContext';

export default function RootLayout() {
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
