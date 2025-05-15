import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FilterTickets, 
  Ticket,
  DateRange
} from '@shared/schema';
import * as localStorage from './localStorageService';

// API hooks for tickets
export const useTickets = (filters: FilterTickets) => {
  return useQuery({
    queryKey: ['/api/tickets', filters],
    queryFn: () => localStorage.filterTickets(filters),
  });
};

export const useRecentTickets = (limit: number = 5) => {
  return useQuery({
    queryKey: ['/api/tickets/recent', limit],
    queryFn: () => localStorage.getRecentTickets(limit),
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      // Set a default createdBy if not provided
      if (!data.createdBy) {
        data.createdBy = 1; // Default user ID (admin)
      }
      return Promise.resolve(localStorage.createTicket(data));
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/trend'] });
    },
  });
};

// API hooks for technicians
export const useTechnicians = () => {
  return useQuery({
    queryKey: ['/api/technicians'],
    queryFn: () => localStorage.getTechniciansWithStats(),
  });
};

// API hooks for statistics
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['/api/stats/dashboard'],
    queryFn: () => localStorage.getDashboardStats(),
  });
};

export const useCategoryStats = () => {
  return useQuery({
    queryKey: ['/api/stats/categories'],
    queryFn: () => localStorage.getCategoryStats(),
  });
};

export const useMonthlyTrend = () => {
  return useQuery({
    queryKey: ['/api/stats/trend'],
    queryFn: () => localStorage.getMonthlyTrend(),
  });
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: async (data: DateRange) => {
      return Promise.resolve(localStorage.getReportSummary(data));
    },
  });
};