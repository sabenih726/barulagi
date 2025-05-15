import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function getInitials(name: string) {
  const names = name.split(' ');
  if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
  return (names[0][0] + names[1][0]).toUpperCase();
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'waiting':
      return { bg: 'bg-warning/10', text: 'text-warning' };
    case 'in_progress':
      return { bg: 'bg-primary/10', text: 'text-primary' };
    case 'completed':
      return { bg: 'bg-success/10', text: 'text-success' };
    default:
      return { bg: 'bg-neutral-200', text: 'text-neutral-500' };
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return { bg: 'bg-error/10', text: 'text-error' };
    case 'medium':
      return { bg: 'bg-warning/10', text: 'text-warning' };
    case 'low':
      return { bg: 'bg-neutral-200', text: 'text-neutral-500' };
    default:
      return { bg: 'bg-neutral-200', text: 'text-neutral-500' };
  }
}

export function translateStatus(status: string) {
  switch (status) {
    case 'waiting':
      return 'Menunggu';
    case 'in_progress':
      return 'Proses';
    case 'completed':
      return 'Selesai';
    default:
      return status;
  }
}

export function translatePriority(priority: string) {
  switch (priority) {
    case 'high':
      return 'Tinggi';
    case 'medium':
      return 'Sedang';
    case 'low':
      return 'Rendah';
    default:
      return priority;
  }
}

export function translateFacilityType(type: string) {
  switch (type) {
    case 'electrical':
      return 'Elektrikal';
    case 'plumbing':
      return 'Pipa/Plumbing';
    case 'ac':
      return 'AC/Pendingin';
    case 'furniture':
      return 'Furnitur';
    case 'it':
      return 'Perangkat IT';
    case 'other':
      return 'Lainnya';
    default:
      return type;
  }
}
