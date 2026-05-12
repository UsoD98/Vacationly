import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck2, CalendarX2, History, Palmtree, PlusCircle, Settings, } from 'lucide-react';
import { useToastStore } from '@/stores/toastStore';
import { vacationApi } from '@/api/vacation';
import { getApiErrorMessage } from '@/utils/apiError';

const formatVacation = (value: number | null) => {
  if (value === null) {
    return '-';
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
};

export default function Index() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [totalVacation, setTotalVacation] = useState<number | null>(null);
  const [usedVacation, setUsedVacation] = useState<number | null>(null);
  const [remainingVacation, setRemainingVacation] = useState<number | null>(null);
  const [totalVacationInput, setTotalVacationInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadVacationSummary = async () => {
      try {
        setIsLoading(true);
        const response = await vacationApi.getVacationSummary();

        if (!response.success || !response.data) {
          addToast({
            message: response.message || '휴가 정보를 불러오지 못했습니다.',
            type: 'error',
            duration: 3000,
          });
          return;
        }

        setTotalVacation(response.data.total_vacation);
        setUsedVacation(response.data.used_vacation);
        setRemainingVacation(response.data.remaining_vacation);
        setTotalVacationInput(String(response.data.total_vacation));
      } catch (err) {
        addToast({
          message: getApiErrorMessage(
            err,
            '휴가 정보를 불러오는 중 오류가 발생했습니다.',
          ),
          type: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadVacationSummary();
  }, [addToast]);

  const handleSaveVacationSetting = async () => {
    const trimmedValue = totalVacationInput.trim();
    if (!trimmedValue) {
      addToast({
        message: '총 휴가를 입력해 주세요.',
        type: 'warning',
        duration: 2500,
      });
      return;
    }

    const parsedValue = Number(trimmedValue);
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      addToast({
        message: '총 휴가는 0 이상의 숫자로 입력해 주세요.',
        type: 'warning',
        duration: 2500,
      });
      return;
    }

    try {
      setIsSaving(true);
      const nextValue = Number(parsedValue.toFixed(1));
      const result = await vacationApi.saveInitialVacation({
        vacation_available: nextValue,
      });

      if (!result.success || !result.data) {
        addToast({
          message: result.message || '휴가 정보 저장에 실패했습니다.',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      setTotalVacation(result.data.total_vacation);
      setUsedVacation(result.data.used_vacation);
      setRemainingVacation(result.data.remaining_vacation);
      setTotalVacationInput(String(nextValue));
      addToast({
        message: result.message || '휴가 정보가 저장되었습니다.',
        type: 'success',
        duration: 2200,
      });
    } catch (err) {
      addToast({
        message: getApiErrorMessage(
          err,
          '휴가 정보 업데이트 중 오류가 발생했습니다.',
        ),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="w-full max-w-6xl py-2 md:py-6">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold md:text-3xl">
              👋 반가워요!
          </h1>
          <p className="text-base-content/70">오늘도 활기찬 하루 보내세요.</p>
        </div>

        <div className="card border border-base-300 bg-base-100">
          <div className="card-body p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Settings size={16} className="text-base-content/70" />
              <input
                type="number"
                min={0}
                step="0.5"
                value={totalVacationInput}
                onChange={(e) => setTotalVacationInput(e.target.value)}
                placeholder="총 휴가 입력"
                className="input-bordered input input-sm w-32"
              />
              <button
                type="button"
                onClick={handleSaveVacationSetting}
                className="btn btn-sm btn-primary"
                disabled={isSaving || isLoading}
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="relative card-body overflow-hidden">
            <CalendarCheck2
              size={100}
              className="pointer-events-none absolute -right-4 -bottom-6 text-info/15"
            />
            <p className="text-sm font-semibold text-base-content/70">
              총 부여 연차
            </p>
            <p className="text-3xl font-extrabold text-info">
              {isLoading ? '...' : formatVacation(totalVacation)}
              <span className="ml-1 text-xl font-semibold text-base-content/60">
                일
              </span>
            </p>
          </div>
        </article>

        <article className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="relative card-body overflow-hidden">
            <CalendarX2
              size={100}
              className="pointer-events-none absolute -right-4 -bottom-6 text-warning/20"
            />
            <p className="text-sm font-semibold text-base-content/70">
              사용 연차
            </p>
            <p className="text-3xl font-extrabold text-warning">
              {isLoading ? '...' : formatVacation(usedVacation)}
              <span className="ml-1 text-xl font-semibold text-base-content/60">
                일
              </span>
            </p>
          </div>
        </article>

        <article className="card bg-primary text-primary-content shadow-md">
          <div className="relative card-body overflow-hidden">
            <Palmtree
              size={100}
              className="pointer-events-none absolute -right-4 -bottom-6 text-white/25"
            />
            <p className="text-sm font-semibold text-primary-content/90">
              남은 연차
            </p>
            <p className="text-3xl font-extrabold">
              {isLoading ? '...' : formatVacation(remainingVacation)}
              <span className="ml-1 text-xl font-semibold text-primary-content/80">
                일
              </span>
            </p>
          </div>
        </article>
      </div>

      <h2 className="mb-4 text-xl font-bold">바로가기</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/vacation/register')}
          className="card cursor-pointer border border-base-300 bg-base-100 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="card-body flex-row items-center gap-4">
            <div className="rounded-xl bg-primary p-3 text-primary-content">
              <PlusCircle size={24} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">휴가 신청하기</p>
              <p className="text-sm text-base-content/70">
                계획하신 휴가가 있다면 미리 신청하세요.
              </p>
            </div>
            <span className="text-base-content/50">&gt;</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/vacation/history')}
          className="card cursor-pointer border border-base-300 bg-base-100 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="card-body flex-row items-center gap-4">
            <div className="rounded-xl bg-secondary p-3 text-secondary-content">
              <History size={24} />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">사용 내역 확인</p>
              <p className="text-sm text-base-content/70">
                지금까지 사용한 휴가 내역을 조회합니다.
              </p>
            </div>
            <span className="text-base-content/50">&gt;</span>
          </div>
        </button>
      </div>
    </section>
  );
}
