interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  let bgColor = '';
  let textColor = '';
  let label = '';
  
  switch (priority) {
    case 'low':
      bgColor = 'bg-neutral-200';
      textColor = 'text-neutral-500';
      label = 'Rendah';
      break;
    case 'medium':
      bgColor = 'bg-warning/10';
      textColor = 'text-warning';
      label = 'Sedang';
      break;
    case 'high':
      bgColor = 'bg-error/10';
      textColor = 'text-error';
      label = 'Tinggi';
      break;
  }
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}
