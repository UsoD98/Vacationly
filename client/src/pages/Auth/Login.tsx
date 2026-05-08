import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TentTree } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import type { AuthRequest, AuthResponse } from '@/types/auth';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      setIsLoading(true);

      const payload: AuthRequest = { email, password };
      const { accessToken, user }: AuthResponse = await authApi.login(payload);

      if (!accessToken || !user) {
        setError('서버 응답이 올바르지 않습니다.');
        return;
      }

      const authStore = useAuthStore.getState();
      authStore.setAccessToken(accessToken);
      authStore.setUser(user);

      navigate('/home', { replace: true });
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };

        setError(
          axiosError.response?.data?.message ||
            axiosError.message ||
            '로그인 실패',
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('로그인 실패');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <fieldset className="fieldset w-xs rounded-box border border-base-300 p-8 shadow-2xl">
        <TentTree className="mx-auto text-primary-500" size={60} />
        <div className="text-center">
          <h5 className="m-2 text-xl">환영합니다!</h5>
          <p className="mb-8 text-sm text-secondary">
            Vacationly 서비스에 로그인하세요.
          </p>
        </div>

        <label className="label">이메일</label>
        <input
          type="email"
          placeholder="mail@site.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mb-4 w-full"
        />

        <label className="label">비밀번호</label>
        <div className="validator input flex items-center gap-2">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Password"
            className="grow"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
        </div>

        {error && <p className="mt-2 text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="btn mt-4 bg-primary-500 text-primary-50"
        >
          {isLoading ? '로그인 중...' : 'Login'}
        </button>
      </fieldset>
    </form>
  );
}
