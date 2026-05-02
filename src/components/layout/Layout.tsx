import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/HeaderLayout.tsx';
import { Footer } from '@/components/layout/FooterLayout.tsx';

export default function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}