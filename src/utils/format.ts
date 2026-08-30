export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatCompact(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}

const DAY_MS = 86_400_000;

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function formatRelativeDay(iso: string, now = Date.now()): string {
  const target = new Date(iso).setHours(0, 0, 0, 0);
  const today = new Date(now).setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / DAY_MS);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
  return formatDate(iso);
}

export function toDateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function dateKeyOf(value: string | number): string {
  return toDateKey(new Date(value));
}

export function monthKey(iso: string): string {
  return toDateKey(new Date(iso)).slice(0, 7);
}

export function yearKey(iso: string): string {
  return String(new Date(iso).getFullYear());
}

export function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
}
