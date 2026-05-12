import { createHashRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '@/components/layout/Layout.tsx';
import Loading from '@/components/common/Loading.tsx';
import NotFound from '@/components/layout/NotFoundLayout.tsx';
import authRouter from '@/routes/authRouter.tsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.tsx';

const LoadingComponent = <Loading />;
const Index = lazy(() => import('@/pages/Index'));
const VacationRegister = lazy(() => import('@/pages/Vacation/VacationRegister'));
const VacationHistory = lazy(() => import('@/pages/Vacation/VacationHistory'));

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        errorElement: <NotFound />,
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <Suspense fallback={LoadingComponent}>
                  <Index />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'vacation/register',
            element: (
              <ProtectedRoute>
                <Suspense fallback={LoadingComponent}>
                  <VacationRegister />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'vacation/history',
            element: (
              <ProtectedRoute>
                <Suspense fallback={LoadingComponent}>
                  <VacationHistory />
                </Suspense>
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  ...authRouter(),
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
