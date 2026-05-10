import {TentTree} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import React, {useState} from 'react';
import {userApi} from '@/api/user';
import {useToastStore} from '@/stores/toastStore';
import {getApiErrorMessage} from '@/utils/apiError';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPassword_confirmation] = useState('');
  const [hire_date, setHire_date] = useState('');
  const [vacation_available, setVacation_available] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  //비밀번호 확인 일치여부 체크
  const handleRegister = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);

      // 필드 검증
      if (!name.trim()) {
        addToast({
          message: '이름을 입력해주세요',
          type: 'warning',
          duration: 2000,
        });
        setIsLoading(false);
        return;
      }

      if (!email.trim()) {
        addToast({
          message: '이메일을 입력해주세요',
          type: 'warning',
          duration: 2000,
        });
        setIsLoading(false);
        return;
      }

      if (!password) {
        addToast({
          message: '비밀번호를 입력해주세요',
          type: 'warning',
          duration: 2000,
        });
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        addToast({
          message: '비밀번호는 최소 6자 이상이어야 합니다',
          type: 'warning',
          duration: 2000,
        });
        setIsLoading(false);
        return;
      }

      if (password !== password_confirmation) {
        addToast({
          message: '비밀번호와 비밀번호 확인이 일치하지 않습니다',
          type: 'warning',
          duration: 2000,
        });
        setIsLoading(false);
        return;
      }

      if (!hire_date) {
        addToast({
          message: '입사일을 선택해주세요',
          type: 'warning',
          duration: 2000,
        });
        setIsLoading(false);
        return;
      }

      // API 호출 - UserController의 createUser에 맞춘 데이터 전송
      const response = await userApi.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        hire_date,
      });

      if (response.success) {
        // 회원가입 성공 시 Toast 표시
        addToast({
          message: '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.',
          type: 'success',
          duration: 2000,
        });

        // Toast가 표시되는 동안 짧은 지연 후 이동
        setTimeout(() => {
          navigate('/auth/login', { replace: true });
        }, 300);
      } else {
        addToast({
          message: response.message || '회원가입에 실패했습니다',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, '회원가입 중 오류가 발생했습니다');
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
    <form onSubmit={handleRegister}>
      <fieldset className="fieldset w-xs rounded-box border border-base-300 p-8 shadow-2xl">
        <TentTree className="mx-auto text-primary-500" size={60} />
        <div className="text-center">
          <h5 className="m-2 text-xl">회원가입</h5>
          <p className="mb-2 text-sm text-secondary">
            Vacationly 서비스에 가입하세요.
          </p>
        </div>

        <label className="label">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          className="input mb-2 w-full"
        />

        <label className="label">이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="mail@site.com"
          className="input mb-2 w-full"
        />

        <label className="label">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="input mb-2 w-full"
        />

        <label className="label">비밀번호 확인</label>
        <input
          type="password"
          value={password_confirmation}
          onChange={(e) => setPassword_confirmation(e.target.value)}
          placeholder="비밀번호 확인"
          className="input mb-2 w-full"
        />

        <label className="label">입사일</label>
        <input
          type="date"
          value={hire_date}
          onChange={(e) => setHire_date(e.target.value)}
          className="input mb-4 w-full"
        />

        <label className="label">올해 연차</label>
        <input
          type="number"
          value={vacation_available}
          onChange={(e) => setVacation_available(Number(e.target.value))}
          placeholder="예: 15"
          className="input mb-2 w-full"
          min="0"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="btn mt-2 w-full bg-primary-500 text-primary-50"
        >
          {isLoading ? '회원가입 중...' : '회원가입'}
        </button>
        <div className="mt-4 text-center text-sm text-secondary">
          이미 계정이 있으신가요?{' '}
          <Link
            to="/auth/login"
            className="font-semibold text-slate-500 underline-offset-4 hover:underline"
          >
            로그인
          </Link>
        </div>
      </fieldset>
    </form>
  );
}
