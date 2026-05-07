import { useState } from 'react';
// React 19의 SubmitEventHandler와 ChangeEventHandler를 임포트합니다.
import type { ChangeEventHandler, SubmitEventHandler } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { userService, type User, type UserInput } from '@/api/userService';

export default function About() {
  const queryClient = useQueryClient();

  // UI 상태 관리
  const [editingId, setEditingId] = useState<number | null>(null);
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // 폼 상태 관리
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    email: '',
    password: '',
    hire_date: '',
  });

  // [GET] 사용자 목록 조회
  const {
    data: users = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  // 공통 초기화 로직
  const resetFormAndSetSuccess = (message: string) => {
    setSuccess(message);
    setFormError('');
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', hire_date: '' });
    setTimeout(() => setSuccess(''), 3000);
  };

  // 공통 에러 처리 로직
  const handleError = (err: unknown, defaultMessage: string) => {
    if (err instanceof AxiosError) {
      setFormError(
        err.response?.data?.message || err.message || defaultMessage,
      );
    } else if (err instanceof Error) {
      setFormError(err.message || defaultMessage);
    } else {
      setFormError(defaultMessage);
    }
  };

  // [POST] 사용자 추가
  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      resetFormAndSetSuccess('사용자가 성공적으로 추가되었습니다');
    },
    onError: (err: unknown) => handleError(err, '사용자 추가 실패'),
  });

  // [PUT] 사용자 수정
  const updateMutation = useMutation({
    mutationFn: userService.updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      resetFormAndSetSuccess('사용자가 성공적으로 수정되었습니다');
    },
    onError: (err: unknown) => handleError(err, '사용자 수정 실패'),
  });

  // [DELETE] 사용자 삭제
  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      resetFormAndSetSuccess('사용자가 성공적으로 삭제되었습니다');
    },
    onError: (err: unknown) => handleError(err, '사용자 삭제 실패'),
  });

  // 입력 핸들러
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ React 19: SubmitEventHandler 적용
  // 브라우저의 SubmitEvent를 포함하는 React 전용 핸들러 타입입니다.
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    setFormError('');

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.hire_date
    ) {
      setFormError('모든 필드를 입력해주세요');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, userData: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // 수정 시작
  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      hire_date: user.hire_date,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', hire_date: '' });
  };

  // 삭제 처리
  const handleDelete = (id: number) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    deleteMutation.mutate(id);
  };

  // 에러 메시지 통합
  const displayError =
    formError || (queryError instanceof Error ? queryError.message : null);

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-base-content">
          사용자 관리 시스템
        </h1>
        <p className="text-base-content/70">
          React 19 + daisyUI FieldSet 적용 예시
        </p>
      </div>

      {/* 메시지 알림 영역 */}
      {displayError && (
        <div role="alert" className="mb-6 alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{displayError}</span>
        </div>
      )}
      {success && (
        <div role="alert" className="mb-6 alert alert-success text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* daisyUI Fieldset 적용 */}
      <div className="mb-10">
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset w-full max-w-2xl rounded-box border border-base-300 bg-base-200 p-6">
            <legend className="fieldset-legend px-2 text-lg font-semibold">
              {editingId ? '사용자 정보 수정' : '새로운 사용자 추가'}
            </legend>

            <div className="mt-2 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label text-xs font-bold uppercase opacity-70">
                  이름
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-bordered input w-full bg-base-100"
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-bold uppercase opacity-70">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-bordered input w-full bg-base-100"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-bold uppercase opacity-70">
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-bordered input w-full bg-base-100"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-bold uppercase opacity-70">
                  입사일
                </label>
                <input
                  type="text"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleInputChange}
                  className="input-bordered input w-full bg-base-100"
                  placeholder="20260507"
                  maxLength={8}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <span className="loading loading-spinner"></span>
                ) : editingId ? (
                  '수정 완료'
                ) : (
                  '사용자 추가'
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn border-base-300 btn-ghost"
                >
                  취소
                </button>
              )}
            </div>
          </fieldset>
        </form>
      </div>

      {/* 목록 테이블 (daisyUI) */}
      <div className="rounded-box border border-base-300 bg-base-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">사용자 목록</h2>
          <button
            onClick={() => refetch()}
            className="btn btn-outline btn-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-xs loading-spinner"></span>
            ) : (
              '새로고침'
            )}
          </button>
        </div>

        {/* ... 테이블 영역 생략 (위와 동일) ... */}
        {/* (중간 테이블 코드는 이전 답변과 동일하므로 유지하시면 됩니다) */}
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table w-full table-zebra text-center">
            <thead>
              <tr className="bg-base-200">
                <th>ID</th>
                <th>이름</th>
                <th>이메일</th>
                <th>입사일</th>
                <th>생성일시</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.hire_date}</td>
                  <td>{user.created_at}</td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn btn-xs btn-info"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn text-white btn-xs btn-error"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
