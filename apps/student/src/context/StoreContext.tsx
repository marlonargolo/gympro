// AppStore — faithful TypeScript port of SwiftUI @EnvironmentObject AppStore
import React, { createContext, useContext, useState } from 'react';
import type { PerfilUsuario, FeedPost, RegistroEvolucao, WatchNotification } from '../data/types';
import { defaultPerfil } from '../data/types';
import { mockFeed, mockEvolucao, mockTreinos } from '../data/mock-data';
import type { Treino } from '../data/types';

interface AppStore {
  perfil: PerfilUsuario;
  setPerfil: (p: PerfilUsuario) => void;
  treinos: Treino[];
  feed: FeedPost[];
  addFeedPost: (post: FeedPost) => void;
  evolucao: RegistroEvolucao[];
  watchNotifications: WatchNotification[];
  addWatchNotification: (n: WatchNotification) => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [perfil, setPerfil] = useState<PerfilUsuario>(defaultPerfil);
  const [feed, setFeed] = useState<FeedPost[]>(mockFeed);
  const [evolucao] = useState<RegistroEvolucao[]>(mockEvolucao);
  const [watchNotifications, setWatchNotifications] = useState<WatchNotification[]>([]);

  function addFeedPost(post: FeedPost) {
    setFeed(prev => [post, ...prev]);
  }

  function addWatchNotification(n: WatchNotification) {
    setWatchNotifications(prev => [n, ...prev]);
  }

  return (
    <StoreContext.Provider value={{
      perfil, setPerfil,
      treinos: mockTreinos,
      feed, addFeedPost,
      evolucao,
      watchNotifications, addWatchNotification,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): AppStore {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
