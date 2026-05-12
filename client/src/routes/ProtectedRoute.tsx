import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Loading from '@/components/common/Loading';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true면 로그인 필수, false면 로그인한 사용자는 진입 불가
}

export function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { accessToken, isHydrated } = useAuthStore();
  const isAuthenticated = !!accessToken;

  // 아직 hydrate가 완료되지 않았다면 로딩 표시
  if (!isHydrated) {
    return <Loading />;
  }

  // 로그인이 필요한 페이지인데 로그인하지 않았다면
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // 로그인하지 않아야 하는 페이지(로그인, 회원가입)인데 이미 로그인했다면
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
