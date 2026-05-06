import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  closeSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: false, // 초기 상태: 닫힘
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      setSidebarOpen: (isOpen) => set({ isOpen }),
      closeSidebar: () => set({ isOpen: false }),
    }),
    {
      name: 'sidebar-storage', // localStorage에 저장될 키 이름
    }
  )
);