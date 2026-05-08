import { useEffect } from 'react';
import AppRouter from '@/routes/router.tsx';
import { useAuthStore } from '@/stores/authStore';

export default function App() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return <AppRouter />;
}
