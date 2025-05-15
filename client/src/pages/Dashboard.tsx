import { useQuery } from "@tanstack/react-query";
import { DashboardStats, CategoryStats, MonthlyTrend, TicketWithTechnician } from "@shared/schema";
import { Link } from "wouter";
import StatCard from "@/components/StatCard";
import TicketTable from "@/components/TicketTable";
import StatusChart from "@/components/charts/StatusChart";
import CategoryChart from "@/components/charts/CategoryChart";
import TrendChart from "@/components/charts/TrendChart";

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/stats/dashboard'],
  });
  
  // Fetch recent tickets
  const { data: recentTickets, isLoading: isLoadingTickets } = useQuery<TicketWithTechnician[]>({
    queryKey: ['/api/tickets/recent'],
  });
  
  // Fetch category stats
  const { data: categoryStats, isLoading: isLoadingCategories } = useQuery<CategoryStats>({
    queryKey: ['/api/stats/categories'],
  });
  
  // Fetch monthly trend
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useQuery<MonthlyTrend[]>({
    queryKey: ['/api/stats/trend'],
  });
  
  if (isLoadingStats || isLoadingTickets || isLoadingCategories || isLoadingTrend) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  if (!stats || !recentTickets || !categoryStats || !monthlyTrend) {
    return <div className="text-center py-10">Failed to load dashboard data</div>;
  }
  
  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Tiket"
          value={stats.totalTickets}
          icon="confirmation_number"
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          changeValue={stats.totalChange}
          changeText="dari bulan lalu"
        />
        
        <StatCard
          title="Menunggu"
          value={stats.pendingTickets}
          icon="pending_actions"
          iconBgColor="bg-warning/10"
          iconColor="text-warning"
          changeValue={stats.pendingChange}
          changeText="dari bulan lalu"
        />
        
        <StatCard
          title="Dalam Proses"
          value={stats.inProgressTickets}
          icon="engineering"
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          changeValue={stats.inProgressChange}
          changeText="dari bulan lalu"
        />
        
        <StatCard
          title="Selesai"
          value={stats.completedTickets}
          icon="task_alt"
          iconBgColor="bg-success/10"
          iconColor="text-success"
          changeValue={stats.completedChange}
          changeText="dari bulan lalu"
        />
      </div>
      
      {/* Recent Tickets and Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Card */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium">Tiket Terbaru</h3>
          </div>
          <div className="p-4">
            <TicketTable
              tickets={recentTickets}
              totalTickets={recentTickets.length}
              page={1}
              limit={5}
              onPageChange={() => {}}
              showActions={false}
              showTechnician={false}
            />
            <div className="mt-4 text-center">
              <Link href="/tickets">
                <div className="text-primary text-sm font-medium hover:underline cursor-pointer">
                  Lihat Semua Tiket →
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Status Chart Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium">Status Tiket</h3>
          </div>
          <div className="p-4">
            <StatusChart 
              data={{
                waiting: stats.pendingTickets,
                inProgress: stats.inProgressTickets,
                completed: stats.completedTickets
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Category Chart and Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Category Chart Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium">Tiket per Kategori</h3>
          </div>
          <div className="p-4">
            <CategoryChart data={categoryStats} />
          </div>
        </div>
        
        {/* Trend Chart Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium">Tren Tiket Bulanan</h3>
          </div>
          <div className="p-4">
            <TrendChart data={monthlyTrend} />
          </div>
        </div>
      </div>
    </div>
  );
}
