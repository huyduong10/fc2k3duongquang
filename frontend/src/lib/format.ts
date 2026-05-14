export const formatCurrency = (value: number, currency = 'VND') =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: undefined,
  }).format(typeof value === 'string' ? new Date(value) : value);

export const resultLabel = (result: 'win' | 'draw' | 'loss') => {
  if (result === 'win') return 'Thắng';
  if (result === 'draw') return 'Hòa';
  return 'Thua';
};
