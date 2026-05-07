import { useState } from 'react'; // 상태 관리를 위해 추가
import { Eye, EyeOff, TentTree } from 'lucide-react'; // 아이콘 추가

export default function Login() {
  // 비밀번호 표시 여부를 결정하는 상태
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <fieldset className="fieldset w-xs rounded-box border border-base-300 p-8 shadow-2xl">
      <TentTree className="mx-auto text-primary-500" size={60} />

      <div className="text-center">
        <h5 className="m-2 text-xl">환영합니다!</h5>
        <p className="mb-8 text-sm text-secondary">
          Vacationly 서비스에 로그인하세요.
        </p>
      </div>

      <label className="label">이메일</label>
      <label
        className="tooltip validator input tooltip-error"
        data-tip="올바른 이메일 형식을 입력해주세요"
      >
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </g>
        </svg>
        <input
          type="email"
          placeholder="mail@site.com"
          required
          title="올바른 이메일 형식을 입력해주세요 (예: user@example.com)"
        />
      </label>

      <label className="label">비밀번호</label>
      <label className="validator input flex items-center gap-2">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
          </g>
        </svg>

        {/* type을 상태에 따라 password 또는 text로 전환 */}
        <input
          type={showPassword ? 'text' : 'password'}
          required
          placeholder="Password"
          className="grow"
        />

        {/* 토글 버튼 추가 */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="focus:outline-none"
        >
          {showPassword ? (
            <EyeOff size={18} className="opacity-50 hover:opacity-100" />
          ) : (
            <Eye size={18} className="opacity-50 hover:opacity-100" />
          )}
        </button>
      </label>

      <button className="btn mt-4 bg-primary-500 text-primary-50">Login</button>
    </fieldset>
  );
}
