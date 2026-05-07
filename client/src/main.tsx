import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 실패 시 재시도 횟수
      staleTime: 1000 * 60 * 5, // 5분간 데이터 캐시 유지
    },
  },
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    {/* 2. Provider 설정 */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
