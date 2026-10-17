import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface StoredUser {
  professional_profile?: {
    is_personal_trainer?: boolean;
    is_nutritionist?: boolean;
  };
}

function useProfessionalType() {
  const [isPT, setIsPT] = useState(true);
  const [isNutri, setIsNutri] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then((raw) => {
      if (!raw) return;
      try {
        const user: StoredUser = JSON.parse(raw);
        const prof = user?.professional_profile;
        if (prof) {
          setIsPT(prof.is_personal_trainer ?? true);
          setIsNutri(prof.is_nutritionist ?? false);
        }
      } catch {}
    });
  }, []);

  return { isPT, isNutri };
}

export default function TabsLayout() {
  const { isPT, isNutri } = useProfessionalType();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: 'Alunos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Treinos',
          href: isPT ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrição',
          href: isNutri ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
