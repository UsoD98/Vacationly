import { cn } from '@/utils/cn.ts';
import { NavLink } from 'react-router-dom';
import ThemeController from '@/components/common/ThemeController.tsx';
import { Bell, Menu, TicketsPlane, User } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore.ts';

export const Header = () => {
  // Store에서 토글 함수 가져오기
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

  return (
    <div className={cn('navbar', 'bg-primary-500', 'text-white', 'px-4', 'sticky', 'top-0', 'z-50')}>
      <button
        onClick={toggleSidebar}
        className={cn(
          'p-2',
          'rounded-full',
          'cursor-pointer',
          'hover:bg-white/20' /* Hover 시 반투명한 흰색 배경 */,
          'transition-colors',
          'border-none',
          'bg-transparent',
        )}
        aria-label="Toggle Sidebar"
      >
        <Menu />
      </button>
      <div className={cn('navbar-start', 'px-6')}>
        <NavLink
          to="/"
          className={cn('font-bold', 'text-2xl', 'flex', 'gap-2')}
        >
          <TicketsPlane className="my-auto" />
          Vacationly
        </NavLink>
      </div>
      <div className={cn('navbar-end', 'px-6', 'gap-2')}>
        <ThemeController />
        <Bell />
        <User />
      </div>
    </div>
  );
};
