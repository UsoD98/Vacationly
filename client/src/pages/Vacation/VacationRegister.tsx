import { type SubmitEventHandler, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, Info, Palmtree, Send, TentTree } from 'lucide-react';
import { vacationApi } from '@/api/vacation';
import { useToastStore } from '@/stores/toastStore';
import { getApiErrorMessage } from '@/utils/apiError';
import { setDateTime } from '@/utils/date';

const toDateInputValue = (date: Date) => {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
};

const parseDateInput = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getInclusiveDayCount = (startDate: string, endDate: string): number => {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);

  if (!start || !end) {
    return 0;
  }

  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
};

type VacationType = 'full' | 'am' | 'pm';

const VACATION_TYPE_OPTIONS: Array<{
  value: VacationType;
  label: string;
  description: string;
}> = [
  { value: 'full', label: '🌴 종일', description: '1.0일 차감' },
  { value: 'am', label: '☀️ 오전 반차', description: '0.5일 차감' },
  { value: 'pm', label: '🌙 오후 반차', description: '0.5일 차감' },
];

const getVacationTimeRange = (type: VacationType): { startTime: string; endTime: string } => {
  if (type === 'am') {
    return { startTime: '0900', endTime: '1330' };
  }

  if (type === 'pm') {
    return { startTime: '1330', endTime: '1800' };
  }

  return { startTime: '0900', endTime: '1800' };
};

export default function VacationRegister() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [startDate, setStartDate] = useState(() =>
    toDateInputValue(new Date()),
  );
  const [endDate, setEndDate] = useState(() => toDateInputValue(new Date()));
  const [vacationType, setVacationType] = useState<VacationType>('full');
  const [reason, setReason] = useState('');
  const [remainingVacation, setRemainingVacation] = useState<number | null>(
    null,
  );
  const [isLoadingRemaining, setIsLoadingRemaining] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHalfDay = vacationType !== 'full';

  useEffect(() => {
    const loadRemainingVacation = async () => {
      try {
        setIsLoadingRemaining(true);
        const response = await vacationApi.getRemainingVacation();

        if (!response.success) {
          addToast({
            message: response.message || '남은 연차를 불러오지 못했습니다.',
            type: 'error',
            duration: 3000,
          });
          setRemainingVacation(null);
          return;
        }

        setRemainingVacation(response.data?.remaining ?? null);
      } catch (err) {
        setRemainingVacation(null);
        addToast({
          message: getApiErrorMessage(
            err,
            '남은 연차를 불러오는 중 오류가 발생했습니다.',
          ),
          type: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoadingRemaining(false);
      }
    };

    void loadRemainingVacation();
  }, [addToast]);

  const calculatedDays = useMemo(() => {
    if (!startDate || !endDate) {
      return 0;
    }

    if (isHalfDay) {
      return 0.5;
    }

    const dayCount = getInclusiveDayCount(startDate, endDate);
    return dayCount > 0 ? dayCount : 0;
  }, [endDate, isHalfDay, startDate]);

  const validationMessage = useMemo(() => {
    if (!startDate || !endDate) {
      return '휴가 시작일과 종료일을 모두 선택해주세요.';
    }

    const start = parseDateInput(startDate);
    const end = parseDateInput(endDate);

    if (!start || !end) {
      return '올바른 날짜를 선택해주세요.';
    }

    if (end < start) {
      return '종료일은 시작일보다 빠를 수 없습니다.';
    }

    if (isHalfDay && startDate !== endDate) {
      return '반차는 하루만 선택할 수 있습니다.';
    }

    if (!reason.trim()) {
      return '신청 사유를 입력해주세요.';
    }

    if (remainingVacation !== null && calculatedDays > remainingVacation) {
      return '남은 휴가보다 많은 일수를 신청할 수 없습니다.';
    }

    if (calculatedDays <= 0) {
      return '차감 예상 일수가 0보다 커야 합니다.';
    }

    return '';
  }, [
    calculatedDays,
    endDate,
    isHalfDay,
    reason,
    remainingVacation,
    startDate,
  ]);

  const canSubmit =
    validationMessage.length === 0 && !isLoadingRemaining && !isSubmitting;

  const handleTypeChange = (value: VacationType) => {
    setVacationType(value);

    if (value !== 'full') {
      setEndDate(startDate);
    }
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (validationMessage) {
      addToast({
        message: validationMessage,
        type: 'warning',
        duration: 2500,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const { startTime, endTime } = getVacationTimeRange(vacationType);
      const normalizedStartDate = setDateTime(startDate);
      const normalizedEndDate = setDateTime(endDate);
      const requestStartDate = normalizedStartDate ? `${normalizedStartDate}${startTime}` : '';
      const requestEndDate = normalizedEndDate ? `${normalizedEndDate}${endTime}` : '';

      if (
        !requestStartDate ||
        !requestEndDate ||
        requestStartDate.length !== 12 ||
        requestEndDate.length !== 12
      ) {
        addToast({
          message: '날짜 형식이 올바르지 않습니다.',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      const response = await vacationApi.requestVacation({
        start_date: requestStartDate,
        end_date: requestEndDate,
        used_days: calculatedDays,
        reason: reason.trim(),
      });

      if (!response.success) {
        addToast({
          message: response.message || '휴가 신청에 실패했습니다.',
          type: 'error',
          duration: 3000,
        });
        return;
      }

      addToast({
        message: response.message || '휴가 신청이 완료되었습니다.',
        type: 'success',
        duration: 2200,
      });

      navigate('/vacation/history', { replace: true });
    } catch (err) {
      addToast({
        message: getApiErrorMessage(err, '휴가 신청 중 오류가 발생했습니다.'),
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingVacationLabel = isLoadingRemaining
    ? '확인 중'
    : remainingVacation === null
      ? '조회 실패'
      : `${remainingVacation.toFixed(1)} 일`;

  return (
    <section className="w-full max-w-5xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="mb-6 rounded-2xl border border-base-300 bg-base-100 px-4 py-6 text-center shadow-sm sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-16 sm:w-16">
          <TentTree size={30} />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">휴가 신청</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-base-content/70 sm:text-base">
          열심히 일한 당신, 이제 쉬어갈 시간입니다.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xl sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-col gap-3 rounded-xl bg-base-200/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="badge gap-2 badge-outline px-4 py-3 badge-primary">
              <Info size={16} />
              남은 휴가
            </div>
            <div className="flex items-center gap-2 text-sm text-base-content/70 sm:justify-end">
              {isLoadingRemaining ? (
                <span className="loading loading-xs loading-spinner text-primary" />
              ) : (
                <Palmtree size={16} className="text-primary" />
              )}
              <strong className="text-base-content">{remainingVacationLabel}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">시작일</span>
              </div>
              <div className="join w-full">
                <span className="join-item flex items-center border border-base-300 bg-base-200 px-3 text-base-content/60">
                  <CalendarRange size={18} />
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setStartDate(nextValue);
                    if (isHalfDay) {
                      setEndDate(nextValue);
                    }
                  }}
                  className="input-bordered input join-item w-full"
                  required
                />
              </div>
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">종료일</span>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-bordered input w-full"
                min={startDate}
                required
                disabled={isHalfDay}
              />
              <div className="label">
                <span className="label-text-alt text-base-content/60">
                  {isHalfDay
                    ? '반차는 시작일과 종료일이 동일합니다.'
                    : '종료일은 시작일 이후여야 합니다.'}
                </span>
              </div>
            </label>
          </div>

          <label className="form-control mt-5 w-full">
            <div className="label">
              <span className="label-text font-semibold">휴가 유형</span>
            </div>
            <select
              value={vacationType}
              onChange={(e) => handleTypeChange(e.target.value as VacationType)}
              className="select-bordered select w-full"
            >
              {VACATION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr] xl:gap-6">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">신청 사유</span>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="textarea-bordered textarea min-h-32 w-full"
                placeholder="예: 개인 일정, 가족 행사, 병원 진료 등"
                required
              />
            </label>

            <div className="rounded-2xl border border-base-300 bg-base-200/60 p-4 sm:p-5">
              <div className="mb-3 text-sm font-semibold text-base-content/70">
                차감 예상 일수
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold text-primary sm:text-5xl">
                  {calculatedDays.toFixed(1)}
                </span>
                <span className="pb-1 text-lg text-base-content/70 sm:text-xl">일</span>
              </div>
              <p className="mt-3 text-sm text-base-content/60">
                {isHalfDay
                  ? '반차는 0.5일로 처리되며, 한 번에 하루만 신청할 수 있습니다.'
                  : '종일 휴가는 선택한 기간의 총 일수만큼 차감됩니다.'}
              </p>
            </div>
          </div>

          {validationMessage ? (
            <div className="mt-5 alert alert-warning">
              <Info size={18} />
              <span className="text-sm">{validationMessage}</span>
            </div>
          ) : (
            <div className="mt-5 alert alert-info">
              <Info size={18} />
              <span className="text-sm">
                신청 전에 날짜와 차감 일수를 한 번 더 확인해주세요.
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/vacation/history')}
              className="btn w-full sm:w-auto sm:min-w-32 btn-ghost"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn w-full gap-2 sm:w-auto sm:min-w-40 btn-primary"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-sm loading-spinner" />
                  신청 중...
                </>
              ) : (
                <>
                  <Send size={18} />
                  신청하기
                </>
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}
