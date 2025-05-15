interface StatusBadgeProps {
  status: 'waiting' | 'in_progress' | 'completed';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let bgColor = '';
  let textColor = '';
  let label = '';
  
  switch (status) {
    case 'waiting':
      bgColor = 'bg-warning/10';
      textColor = 'text-warning';
      label = 'Menunggu';
      break;
    case 'in_progress':
      bgColor = 'bg-primary/10';
      textColor = 'text-primary';
      label = 'Proses';
      break;
    case 'completed':
      bgColor = 'bg-success/10';
      textColor = 'text-success';
      label = 'Selesai';
      break;
  }
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}
