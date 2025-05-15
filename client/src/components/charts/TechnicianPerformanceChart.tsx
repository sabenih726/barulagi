import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TechnicianWithStats } from "@shared/schema";

interface TechnicianPerformanceChartProps {
  technicians: TechnicianWithStats[];
}

export default function TechnicianPerformanceChart({ technicians }: TechnicianPerformanceChartProps) {
  const chartData = technicians.map(tech => ({
    name: tech.user.fullName,
    activeTickets: tech.activeTickets,
    completedTickets: tech.completedTickets,
    averageTime: tech.averageCompletionTime
  }));
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#1976d2" />
          <YAxis yAxisId="right" orientation="right" stroke="#ff9800" />
          <Tooltip />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="completedTickets" 
            name="Tiket Selesai" 
            fill="#4caf50" 
          />
          <Bar 
            yAxisId="left" 
            dataKey="activeTickets" 
            name="Tiket Aktif" 
            fill="#1976d2" 
          />
          <Bar 
            yAxisId="right" 
            dataKey="averageTime" 
            name="Waktu Rata-rata (hari)" 
            fill="#ff9800" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
