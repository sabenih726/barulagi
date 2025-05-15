import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface StatusChartProps {
  data: {
    waiting: number;
    inProgress: number;
    completed: number;
  };
}

export default function StatusChart({ data }: StatusChartProps) {
  const chartData = [
    { name: "Menunggu", value: data.waiting, color: "#ff9800" },
    { name: "Dalam Proses", value: data.inProgress, color: "#1976d2" },
    { name: "Selesai", value: data.completed, color: "#4caf50" },
  ];
  
  const total = data.waiting + data.inProgress + data.completed;
  
  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="chart-container flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} (${getPercentage(value)}%)`, 'Jumlah']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex flex-col space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">
              {item.value} ({getPercentage(item.value)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
