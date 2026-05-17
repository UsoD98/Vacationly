const DASHED_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const COMPACT_DATE_REGEX = /^\d{8}$/;
const COMPACT_DATE_TIME_REGEX = /^\d{12}$/;

const TIME_REGEX = /^\d{4}$/;

/**
 * `yyyy-MM-dd` 또는 `yyyyMMdd` 형식의 날짜를 `yyyyMMdd` 또는 `yyyyMMddHHmm` 형식으로 반환
 */
export const setDateTime = (date: string, time?: string): string => {
  if (!date) {
    return '';
  }

  const normalizedTime = time?.trim();
  if (normalizedTime && !TIME_REGEX.test(normalizedTime)) {
    return '';
  }

  const appendTime = (normalizedDate: string): string =>
    normalizedTime ? `${normalizedDate}${normalizedTime}` : normalizedDate;

  if (COMPACT_DATE_TIME_REGEX.test(date)) {
    if (normalizedTime) {
      return `${date.slice(0, 8)}${normalizedTime}`;
    }

    return date;
  }

  if (COMPACT_DATE_REGEX.test(date)) {
    return appendTime(date);
  }

  if (DASHED_DATE_REGEX.test(date)) {
    return appendTime(date.replace(/-/g, ''));
  }

  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return appendTime(`${year}${month}${day}`);
};
