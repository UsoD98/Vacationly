import { useEffect } from 'react';
import AppRouter from '@/routes/router.tsx';
import { useAuthStore } from '@/stores/authStore';
import { ToastContainer } from '@/components/common/ToastContainer';

export default function App() {
  useEffect(() => {
    void useAuthStore.getState().hydrate();
  }, []);

  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
}
