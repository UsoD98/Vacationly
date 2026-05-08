import { cn } from '@/utils/cn.ts';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeController from '@/components/common/ThemeController.tsx';
import { Bell, Menu, TicketsPlane, User, LogOut } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebarStore.ts';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';

export const Header = () => {
  const navigate = useNavigate();
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const { user, clear } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      clear();
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <div
      className={cn(
        'navbar',
        'bg-primary-500',
        'text-white',
        'px-4',
        'sticky',
        'top-0',
        'z-50',
      )}
    >
      <button
        onClick={toggleSidebar}
        className={cn(
          'p-2',
          'rounded-full',
          'cursor-pointer',
          'hover:bg-white/20',
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
          to="/about"
          className={cn('font-bold', 'text-2xl', 'flex', 'gap-2')}
        >
          <TicketsPlane className="my-auto" />
          Vacationly
        </NavLink>
      </div>
      <div className={cn('navbar-end', 'px-6', 'gap-2')}>
        <ThemeController />
        <Bell />
        {user ? (
          <div className={cn('dropdown', 'dropdown-end')}>
            <button className={cn('btn', 'btn-ghost', 'btn-circle', 'avatar')}>
              <div className={cn('w-10', 'rounded-full', 'bg-white/20', 'flex', 'items-center', 'justify-center')}>
                <User size={20} />
              </div>
            </button>
            <ul
              className={cn(
                'dropdown-content',
                'z-50',
                'menu',
                'p-2',
                'shadow',
                'bg-base-100',
                'rounded-box',
                'w-52',
              )}
            >
              <li>
                <span className="px-4 py-2">
                  <span className="text-sm">{user.name}</span>
                </span>
              </li>
              <li>
                <span className="px-4 pb-2">
                  <span className="text-xs opacity-70">{user.email}</span>
                </span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn('text-red-500', 'flex', 'items-center', 'gap-2', 'w-full', 'px-4', 'py-2', 'text-left')}
                >
                  <LogOut size={18} />
                  로그아웃
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <NavLink to="/auth/login" aria-label="Login">
            <User />
          </NavLink>
        )}
      </div>
    </div>
  );
};
