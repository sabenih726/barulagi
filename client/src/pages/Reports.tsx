import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CategoryStats, MonthlyTrend, TechnicianWithStats, ReportSummary, DateRange } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TrendChart from "@/components/charts/TrendChart";
import TechnicianPerformanceChart from "@/components/charts/TechnicianPerformanceChart";
import ProblemDistributionChart from "@/components/charts/ProblemDistributionChart";
import { format } from "date-fns";

const formSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  facilityType: z.enum(['all', 'electrical', 'plumbing', 'ac', 'furniture', 'it', 'other']).optional(),
  status: z.enum(['all', 'waiting', 'in_progress', 'completed']).optional(),
});

export default function Reports() {
  // Fetch category stats
  const { data: categoryStats, isLoading: isLoadingCategories } = useQuery<CategoryStats>({
    queryKey: ['/api/stats/categories'],
  });
  
  // Fetch monthly trend
  const { data: monthlyTrend, isLoading: isLoadingTrend } = useQuery<MonthlyTrend[]>({
    queryKey: ['/api/stats/trend'],
  });
  
  // Fetch technicians
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<TechnicianWithStats[]>({
    queryKey: ['/api/technicians'],
  });
  
  const form = useForm<DateRange>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      facilityType: 'all',
      status: 'all',
    },
  });
  
  const generateReportMutation = useMutation({
    mutationFn: async (data: DateRange) => {
      const res = await apiRequest("POST", "/api/stats/report", data);
      return res.json() as Promise<ReportSummary>;
    },
  });
  
  const handleGenerateReport = (data: DateRange) => {
    const payload = {
      ...data,
      facilityType: data.facilityType === 'all' ? undefined : data.facilityType,
      status: data.status === 'all' ? undefined : data.status,
    };
    
    generateReportMutation.mutate(payload);
  };
  
  const handleReset = () => {
    form.reset({
      startDate: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      facilityType: 'all',
      status: 'all',
    });
    generateReportMutation.reset();
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium">Filter Laporan</h3>
          </div>
          <div className="p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGenerateReport)}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Mulai</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Akhir</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="facilityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Fasilitas</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Semua Jenis" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Semua Jenis</SelectItem>
                            <SelectItem value="electrical">Elektrikal</SelectItem>
                            <SelectItem value="plumbing">Pipa/Plumbing</SelectItem>
                            <SelectItem value="ac">AC/Pendingin</SelectItem>
                            <SelectItem value="furniture">Furnitur</SelectItem>
                            <SelectItem value="it">Perangkat IT</SelectItem>
                            <SelectItem value="other">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="waiting">Menunggu</SelectItem>
                            <SelectItem value="in_progress">Dalam Proses</SelectItem>
                            <SelectItem value="completed">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={generateReportMutation.isPending}
                  >
                    {generateReportMutation.isPending ? "Memproses..." : "Terapkan Filter"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
        
        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium">Ringkasan Laporan</h3>
          </div>
          <div className="p-4">
            {generateReportMutation.isPending ? (
              <div className="text-center py-10">Generating report...</div>
            ) : generateReportMutation.data ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-400">Total Tiket</p>
                    <h3 className="text-2xl font-medium">
                      {generateReportMutation.data.totalTickets}
                    </h3>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-400">Rata-rata Penyelesaian</p>
                    <h3 className="text-2xl font-medium">
                      {generateReportMutation.data.avgCompletionTime}
                    </h3>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-400">Tiket Selesai Tepat Waktu</p>
                    <h3 className="text-2xl font-medium">
                      {generateReportMutation.data.onTimePercentage}
                    </h3>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-400">Efisiensi Teknisi</p>
                    <h3 className="text-2xl font-medium">
                      {generateReportMutation.data.technicianEfficiency}
                    </h3>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="link" 
                    className="flex items-center text-primary font-medium"
                  >
                    <span className="material-icons text-sm mr-1">download</span>
                    Unduh Laporan Lengkap
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                Pilih rentang tanggal dan terapkan filter untuk melihat laporan
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Monthly Statistics Chart */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium">Statistik Tiket Bulanan</h3>
          </div>
          <div className="p-4">
            {isLoadingTrend ? (
              <div className="h-[400px] flex items-center justify-center">Loading chart...</div>
            ) : monthlyTrend ? (
              <div style={{ height: 400 }}>
                <TrendChart data={monthlyTrend} />
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center">Failed to load chart data</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Technician Performance and Problem Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium">Performa Teknisi</h3>
          </div>
          <div className="p-4">
            {isLoadingTechnicians ? (
              <div className="h-[300px] flex items-center justify-center">Loading chart...</div>
            ) : technicians ? (
              <TechnicianPerformanceChart technicians={technicians} />
            ) : (
              <div className="h-[300px] flex items-center justify-center">Failed to load chart data</div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-medium">Distribusi Jenis Masalah</h3>
          </div>
          <div className="p-4">
            {isLoadingCategories ? (
              <div className="h-[300px] flex items-center justify-center">Loading chart...</div>
            ) : categoryStats ? (
              <ProblemDistributionChart data={categoryStats} />
            ) : (
              <div className="h-[300px] flex items-center justify-center">Failed to load chart data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
