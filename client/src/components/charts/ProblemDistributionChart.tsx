import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { CategoryStats } from "@shared/schema";

interface ProblemDistributionChartProps {
  data: CategoryStats;
}

export default function ProblemDistributionChart({ data }: ProblemDistributionChartProps) {
  const chartData = [
    { name: 'Elektrikal', value: data.electrical, color: '#1976d2' },
    { name: 'Plumbing', value: data.plumbing, color: '#03a9f4' },
    { name: 'AC', value: data.ac, color: '#00bcd4' },
    { name: 'Furnitur', value: data.furniture, color: '#009688' },
    { name: 'IT', value: data.it, color: '#4caf50' },
    { name: 'Lainnya', value: data.other, color: '#8bc34a' },
  ].filter(item => item.value > 0);
  
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };
  
  return (
    <div style={{ width: '100%', height: 300 }}>
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
  );
}
