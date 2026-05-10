import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Eye, EyeOff, TentTree} from 'lucide-react';
import {authApi} from '@/api/auth';
import {useAuthStore} from '@/stores/authStore';
import {useToastStore} from '@/stores/toastStore';
import type {AuthRequest} from '@/types/auth';
import {getApiErrorMessage} from '@/utils/apiError';

export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      const payload: AuthRequest = { email, password };
      const response = await authApi.login(payload);

      if (!response.success) {
        addToast({
          message: response.message || '로그인에 실패했습니다',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      if (!response.data?.accessToken || !response.data?.user) {
        addToast({
          message: '서버 응답이 올바르지 않습니다.',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      useAuthStore.getState().setSession(response.data.accessToken, response.data.user);

      addToast({
        message: `환영합니다, ${response.data.user.name}님!`,
        type: 'success',
        duration: 2000,
      });

      // Toast가 표시되는 동안 짧은 지연 후 이동
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 300);
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, '로그인 중 오류가 발생했습니다');
      addToast({
        message: errorMessage,
        type: 'error',
        duration: 3000,
      });
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
        <button
          type="submit"
          disabled={isLoading}
          className="btn mt-4 w-full bg-primary-500 text-primary-50"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
        <div className="mt-4 text-center text-sm text-secondary">
          계정이 없으신가요?{' '}
          <Link
            to="/auth/register"
            className="font-semibold text-slate-500 underline-offset-4 hover:underline"
          >
            회원가입
          </Link>
        </div>
      </fieldset>
    </form>
  );
}
