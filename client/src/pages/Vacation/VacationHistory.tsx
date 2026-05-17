import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { vacationApi, type VacationRequest } from '@/api/vacation';
import { getApiErrorMessage } from '@/utils/apiError';

const formatCompactDate = (value: string): string => {
  const compact = value.replace(/\D/g, '');

  if (compact.length < 8) {
    return value;
  }

  return compact.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
};

const formatCompactTime = (value: string): string => {
  const compact = value.replace(/\D/g, '');

  if (compact.length < 12) {
    return '';
  }

  return compact.slice(8, 12).replace(/(\d{2})(\d{2})/, '$1:$2');
};

const formatDateRange = (startStr: string, endStr: string): string => {
  const startDate = formatCompactDate(startStr);
  const endDate = formatCompactDate(endStr);

  if (startDate === endDate) {
    return startDate;
  }

  return `${startDate} ~ ${endDate}`;
};

const formatUsedDays = (value: number | string): string => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(1) : '0.0';
};

const getVacationType = (startStr: string, endStr: string): string => {
  const startDate = formatCompactDate(startStr);
  const endDate = formatCompactDate(endStr);
  const startTime = formatCompactTime(startStr);
  const endTime = formatCompactTime(endStr);

  // 같은 날짜인 경우 (반차)
  if (startDate === endDate && startTime && endTime) {
    if (startTime === '09:00' && endTime === '13:30') {
      return '오전 반차';
    }
    if (startTime === '13:30' && endTime === '18:00') {
      return '오후 반차';
    }
  }

  // 그 외 모든 경우는 연차
  return '연차';
};

export default function VacationHistory() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // 휴가 신청 내역 로드
  useEffect(() => {
    const loadRequests = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await vacationApi.getUserRequests();

        if (!result.success) {
          addToast({
            message:
              result.message || '휴가 내역을 불러오는 중 오류가 발생했습니다.',
            type: 'error',
            duration: 3000,
          });
          return;
        }

        setRequests(result.data || []);
      } catch (err) {
        addToast({
          message: getApiErrorMessage(
            err,
            '휴가 내역 조회 중 오류가 발생했습니다.',
          ),
          type: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadRequests();
  }, [addToast, user?.id]);

  const handleDelete = async (requestId: number) => {
    if (!confirm('정말로 이 휴가 신청을 취소하시겠습니까?')) {
      return;
    }

    try {
      setDeletingIds((prev) => new Set(prev).add(requestId));

      const result = await vacationApi.deleteRequest(requestId);

      if (!result.success) {
        addToast({
          message: result.message || '휴가 신청 취소에 실패했습니다.',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      addToast({
        message: result.message || '휴가 신청이 취소되었습니다.',
        type: 'success',
        duration: 2000,
      });
    } catch (err) {
      addToast({
        message: getApiErrorMessage(
          err,
          '휴가 신청 취소 중 오류가 발생했습니다.',
        ),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const renderDeleteButton = (requestId: number, isCompact = false) => (
    <button
      type="button"
      onClick={() => handleDelete(requestId)}
      disabled={deletingIds.has(requestId)}
      className={`btn gap-1 text-error btn-ghost btn-sm ${
        isCompact ? 'btn-square' : ''
      }`}
      title="신청 취소"
      aria-label="신청 취소"
    >
      {deletingIds.has(requestId) ? (
        <span className="loading loading-sm loading-spinner" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );

  const renderVacationCard = (request: VacationRequest) => (
    <article
      key={request.id}
      className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="badge badge-info badge-sm gap-1 font-semibold sm:badge-md">
              {getVacationType(request.start_date, request.end_date)}
            </span>
            <span className="badge badge-primary badge-sm gap-1 font-semibold sm:badge-md">
              {formatUsedDays(request.used_days)} 일
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-base-content sm:text-base">
            <Calendar size={16} className="shrink-0 text-base-content/50" />
            <span className="truncate">
              {formatDateRange(request.start_date, request.end_date)}
            </span>
          </div>
        </div>

        {renderDeleteButton(request.id, true)}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-base-200/60 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            휴가 유형
          </p>
          <p className="font-medium text-base-content">
            {getVacationType(request.start_date, request.end_date)}
          </p>
        </div>
        <div className="rounded-xl bg-base-200/60 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            사용 일수
          </p>
          <p className="font-medium text-base-content">
            {formatUsedDays(request.used_days)} 일
          </p>
        </div>
        <div className="rounded-xl bg-base-200/60 p-3 sm:col-span-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            사유
          </p>
          <p className="wrap-break-word text-sm leading-6 text-base-content/75">
            {request.reason}
          </p>
        </div>
      </div>
    </article>
  );

  return (
    <section className="w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      {/* 헤더 */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
        <div className="min-w-0">
          <h1 className="mb-1 text-2xl font-bold sm:text-3xl">
            나의 휴가 기록
          </h1>
          <p className="max-w-2xl text-sm text-base-content/70 sm:text-base">
            지금까지의 쉼표들을 확인하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/vacation/register')}
          className="btn w-full gap-2 btn-primary sm:w-auto"
        >
          <Plus size={18} />새 휴가 신청
        </button>
      </div>

      {/* 테이블 */}
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <span className="loading loading-lg loading-spinner text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Calendar size={40} className="text-base-content/30" />
            <p className="text-base-content/70">
              사용 내역이 없습니다. 첫 휴가를 떠나보세요! ✈️
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4 lg:hidden">
              {requests.map((request) => renderVacationCard(request))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="table w-full table-zebra">
                <thead>
                  <tr className="bg-base-200">
                    <th>기간</th>
                    <th>유형</th>
                    <th className="text-center">사용 일수</th>
                    <th>사유</th>
                    <th className="text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="hover align-top">
                      <td className="whitespace-normal">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="shrink-0 text-base-content/50" />
                          <span className="font-medium">
                            {formatDateRange(
                              request.start_date,
                              request.end_date,
                            )}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="badge gap-1 badge-lg font-semibold badge-info">
                          {getVacationType(request.start_date, request.end_date)}
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="badge gap-1 badge-lg font-semibold badge-primary">
                          {formatUsedDays(request.used_days)} 일
                        </div>
                      </td>
                      <td className="max-w-md whitespace-normal">
                        <span className="block wrap-break-word text-sm leading-6 text-base-content/70">
                          {request.reason}
                        </span>
                      </td>
                      <td className="text-right">
                        {renderDeleteButton(request.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
