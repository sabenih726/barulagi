import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterTickets, TicketWithTechnician } from "@shared/schema";
import { useLocation } from "wouter";
import TicketTable from "@/components/TicketTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TicketList() {
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState<FilterTickets>({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
    facilityType: undefined,
    priority: undefined
  });
  
  const { data, isLoading } = useQuery<{ tickets: TicketWithTechnician[], total: number }>({
    queryKey: ['/api/tickets', filters],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to page 1 when searching
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      status: value === 'all' ? undefined : value as 'waiting' | 'in_progress' | 'completed',
      page: 1
    }));
  };
  
  const handleViewTicket = (ticket: TicketWithTechnician) => {
    // Navigate to ticket details page (not implemented in this version)
    console.log("View ticket", ticket);
  };
  
  const handleEditTicket = (ticket: TicketWithTechnician) => {
    // Navigate to ticket edit page (not implemented in this version)
    console.log("Edit ticket", ticket);
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-200">
        <h3 className="font-medium mb-2 md:mb-0">Daftar Tiket</h3>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <form onSubmit={handleSearch} className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-icons text-neutral-400 text-sm">search</span>
            </span>
            <Input
              type="text"
              placeholder="Cari tiket..."
              className="pl-10 pr-4 py-2 w-full md:w-auto"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </form>
          
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="waiting">Menunggu</SelectItem>
              <SelectItem value="in_progress">Dalam Proses</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => navigate("/create-ticket")}
            className="flex items-center justify-center bg-primary text-white"
          >
            <span className="material-icons text-sm mr-1">add</span>
            Tiket Baru
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-10">Loading...</div>
        ) : data ? (
          <TicketTable
            tickets={data.tickets}
            totalTickets={data.total}
            page={filters.page || 1}
            limit={filters.limit || 10}
            onPageChange={handlePageChange}
            onViewTicket={handleViewTicket}
            onEditTicket={handleEditTicket}
          />
        ) : (
          <div className="text-center py-10">Failed to load tickets</div>
        )}
      </div>
    </div>
  );
}
