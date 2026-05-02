import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '@/components/layout/Layout.tsx';
import Loading from '@/components/common/Loading.tsx';
import NotFound from '@/components/layout/NotFoundLayout.tsx';
import RootLayout from '@/components/layout/RootLayout.tsx';

const LoadingComponent = <Loading />;
const Index = lazy(() => import('@/pages/Index'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        element: <RootLayout />,
        errorElement: <NotFound />,
        children: [
          {
            index: true,
            element: <Suspense fallback={LoadingComponent}><Index /></Suspense>,
          },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}