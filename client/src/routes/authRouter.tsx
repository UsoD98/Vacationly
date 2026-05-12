/* eslint-disable react-refresh/only-export-components */

import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import Loading from '@/components/common/Loading.tsx';
import Layout from '@/components/layout/Layout.tsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.tsx';

const LoadingComponent = <Loading />;
const Login = lazy(() => import('@/pages/Auth/Login'));
const Register = lazy(() => import('@/pages/Auth/Register'));

const authRouter = (): RouteObject[] => [
   {
     path: 'auth/',
     element: <Layout />,
     children: [
       {
         path: 'login',
         element: (
           <ProtectedRoute requireAuth={false}>
             <Suspense fallback={LoadingComponent}>
               <Login />
             </Suspense>
           </ProtectedRoute>
         ),
       },
       {
         path: 'register',
         element: (
           <ProtectedRoute requireAuth={false}>
             <Suspense fallback={LoadingComponent}>
               <Register />
             </Suspense>
           </ProtectedRoute>
         ),
       },
     ],
   },
 ];

export default authRouter;
