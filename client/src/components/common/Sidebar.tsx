import { useSidebarStore } from '@/stores/sidebarStore.ts';
import { Link } from 'react-router-dom';
import { Calendar, LayoutDashboard } from 'lucide-react';

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
          {/* 대시보드 */}
          <li>
            <Link to="/" className="flex items-center gap-2">
              <LayoutDashboard size={18} />
              대시보드
            </Link>
          </li>

          {/* 휴가 - 확장 가능한 메뉴 */}
          <li>
            <details>
              <summary className="flex items-center gap-2">
                <Calendar size={18} />
                휴가
              </summary>
              <ul>
                <li>
                  <Link to="/vacation/register">휴가 신청</Link>
                </li>
                <li>
                  <Link to="/vacation/history">사용 내역</Link>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;