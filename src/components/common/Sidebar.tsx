import { useSidebarStore } from '@/stores/sidebarStore.ts';

const Sidebar = () => {
  // Store에서 상태와 상태 변경 함수 가져오기
  const { isOpen, setSidebarOpen } = useSidebarStore();

  return (
    <div className="drawer">
      {/* Store의 상태를 바라보는 제어 컴포넌트로 변경 */}
      <input
        id="my-drawer-1"
        type="checkbox"
        className="drawer-toggle"
        checked={isOpen}
        onChange={(e) => setSidebarOpen(e.target.checked)}
      />
      <div className="drawer-content">
      </div>
      <div className="drawer-side top-16! h-[calc(100vh-4rem)]! z-40">
        <label
          htmlFor="my-drawer-1"
          aria-label="close sidebar"
          className="drawer-overlay top-16! h-[calc(100vh-4rem)]!"
        ></label>
        <ul className="menu min-h-full w-80 bg-base-200 p-4">
          {/* Sidebar content here */}
          <li>
            <a>대시보드</a>
          </li>
          <li>
            <a>휴가</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;