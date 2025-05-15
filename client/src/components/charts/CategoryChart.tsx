import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { CategoryStats } from "@shared/schema";

interface CategoryChartProps {
  data: CategoryStats;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const chartData = [
    { name: 'Elektrikal', value: data.electrical, color: '#1976d2' },
    { name: 'Plumbing', value: data.plumbing, color: '#03a9f4' },
    { name: 'AC', value: data.ac, color: '#00bcd4' },
    { name: 'Furnitur', value: data.furniture, color: '#009688' },
    { name: 'IT', value: data.it, color: '#4caf50' },
    { name: 'Lainnya', value: data.other, color: '#8bc34a' },
  ];
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value}`, 'Jumlah Tiket']} />
          <Bar dataKey="value" fill="#1976d2">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
