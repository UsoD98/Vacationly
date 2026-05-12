import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { vacationApi, type VacationRequest } from '@/api/vacation';
import { getApiErrorMessage } from '@/utils/apiError';

const formatDateRange = (startStr: string, endStr: string): string => {
  const start = startStr.substring(0, 8);
  const end = endStr.substring(0, 8);
  if (start === end) {
    return start.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
  }
  return (
    start.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') +
    ' ~ ' +
    end.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
  );
};

const formatUsedDays = (value: number | string): string => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(1) : '0.0';
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

  return (
    <section className="w-full max-w-5xl py-6">
      {/* 헤더 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold md:text-3xl">
            나의 휴가 기록
          </h1>
          <p className="text-base-content/70">
            지금까지의 쉼표들을 확인하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/vacation/register')}
          className="btn gap-2 self-start btn-primary sm:self-auto"
        >
          <Plus size={18} />새 휴가 신청
        </button>
      </div>

      {/* 테이블 */}
      <div className="card border border-base-300 bg-base-100 shadow-md">
        {isLoading ? (
          <div className="card-body flex items-center justify-center py-12">
            <span className="loading loading-lg loading-spinner text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="card-body flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Calendar size={40} className="text-base-content/30" />
            <p className="text-base-content/70">
              사용 내역이 없습니다. 첫 휴가를 떠나보세요! ✈️
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full table-zebra">
              <thead>
                <tr className="bg-base-200">
                  <th>기간</th>
                  <th>사유</th>
                  <th className="text-center">사용 일수</th>
                  <th className="text-center">상태</th>
                  <th className="text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="hover">
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-base-content/50" />
                        <span className="font-medium">
                          {formatDateRange(
                            request.start_date,
                            request.end_date,
                          )}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-base-content/70">
                        {request.reason}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="badge gap-1 badge-lg font-semibold badge-primary">
                        {formatUsedDays(request.used_days)} 일
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="badge gap-1 badge-success">✓ 승인됨</div>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(request.id)}
                        disabled={deletingIds.has(request.id)}
                        className="btn gap-1 text-error btn-ghost btn-sm"
                        title="신청 취소"
                      >
                        {deletingIds.has(request.id) ? (
                          <>
                            <span className="loading loading-sm loading-spinner" />
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
