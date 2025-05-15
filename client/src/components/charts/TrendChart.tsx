import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MonthlyTrend } from "@shared/schema";

interface TrendChartProps {
  data: MonthlyTrend[];
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="waiting" 
            name="Menunggu"
            stroke="#ff9800" 
            activeDot={{ r: 8 }} 
          />
          <Line 
            type="monotone" 
            dataKey="inProgress" 
            name="Dalam Proses"
            stroke="#1976d2" 
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            name="Selesai"
            stroke="#4caf50" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
