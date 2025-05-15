interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  changeValue: number;
  changeText: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor,
  changeValue,
  changeText 
}: StatCardProps) {
  const isPositiveChange = changeValue >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${iconBgColor} mr-4`}>
          <span className={`material-icons ${iconColor}`}>{icon}</span>
        </div>
        <div>
          <p className="text-sm text-neutral-400">{title}</p>
          <h3 className="text-2xl font-medium">{value}</h3>
        </div>
      </div>
      <div className="mt-2 flex items-center text-sm">
        <span className={`flex items-center ${isPositiveChange ? 'text-success' : 'text-error'}`}>
          <span className="material-icons text-sm mr-1">
            {isPositiveChange ? 'arrow_upward' : 'arrow_downward'}
          </span>
          {Math.abs(changeValue)}%
        </span>
        <span className="ml-1 text-neutral-300">{changeText}</span>
      </div>
    </div>
  );
}
