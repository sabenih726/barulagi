import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterTickets, TicketWithTechnician, TechnicianWithStats } from "@shared/schema";
import { format } from "date-fns";
import TicketTable from "@/components/TicketTable";
import TechnicianCard from "@/components/TechnicianCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";

export default function Assignments() {
  const [selectedTechnician, setSelectedTechnician] = useState<number | undefined>(undefined);
  const [filters, setFilters] = useState<FilterTickets>({
    page: 1,
    limit: 10,
    search: "",
    technicianId: undefined
  });
  
  // Fetch technicians
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<TechnicianWithStats[]>({
    queryKey: ['/api/technicians'],
  });
  
  // Fetch assignments
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<{ tickets: TicketWithTechnician[], total: number }>({
    queryKey: ['/api/tickets', { ...filters, technicianId: selectedTechnician }],
    enabled: selectedTechnician !== undefined,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to page 1 when searching
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  const handleTechnicianChange = (value: string) => {
    if (value === "") {
      setSelectedTechnician(undefined);
    } else {
      setSelectedTechnician(parseInt(value));
    }
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  const handleViewAssignments = (technicianId: number) => {
    setSelectedTechnician(technicianId);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  return (
    <>
      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-200">
          <h3 className="font-medium mb-2 md:mb-0">Penugasan Teknisi</h3>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <form onSubmit={handleSearch} className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-icons text-neutral-400 text-sm">search</span>
              </span>
              <Input
                type="text"
                placeholder="Cari penugasan..."
                className="pl-10 pr-4 py-2 w-full md:w-auto"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </form>
            
            <Select
              value={selectedTechnician?.toString() || ""}
              onValueChange={handleTechnicianChange}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Teknisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Teknisi</SelectItem>
                {technicians?.map(tech => (
                  <SelectItem key={tech.id} value={tech.id.toString()}>
                    {tech.user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="p-4">
          {isLoadingAssignments || (selectedTechnician !== undefined && !assignments) ? (
            <div className="text-center py-10">Loading assignments...</div>
          ) : assignments ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-neutral-400">
                    <th className="pb-3 font-medium">ID Tiket</th>
                    <th className="pb-3 font-medium">Fasilitas</th>
                    <th className="pb-3 font-medium">Teknisi</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Ditugaskan</th>
                    <th className="pb-3 font-medium">Tenggat</th>
                    <th className="pb-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.tickets.length > 0 ? (
                    assignments.tickets.map((ticket) => (
                      <tr key={ticket.id} className="text-sm border-t border-neutral-100">
                        <td className="py-3 pr-4">
                          <span className="font-medium text-primary">{ticket.ticketNumber}</span>
                        </td>
                        <td className="py-3 pr-4">{ticket.facilityName}</td>
                        <td className="py-3 pr-4">
                          {ticket.technician && (
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                                {ticket.technician.initials}
                              </div>
                              <span>{ticket.technician.user.fullName}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="py-3 pr-4">
                          {format(new Date(ticket.updatedAt), 'dd/MM/yyyy')}
                        </td>
                        <td className="py-3 pr-4">
                          {ticket.deadline 
                            ? format(new Date(ticket.deadline), 'dd/MM/yyyy')
                            : '-'
                          }
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-1">
                            <button className="p-1 rounded hover:bg-neutral-100">
                              <span className="material-icons text-neutral-400 text-sm">visibility</span>
                            </button>
                            <button className="p-1 rounded hover:bg-neutral-100">
                              <span className="material-icons text-neutral-400 text-sm">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-neutral-400">
                        {selectedTechnician 
                          ? "Tidak ada penugasan untuk teknisi ini" 
                          : "Silakan pilih teknisi untuk melihat penugasan"
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              Silakan pilih teknisi untuk melihat penugasan
            </div>
          )}
          
          {assignments && assignments.tickets.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-neutral-400">
                Menampilkan {(filters.page - 1) * filters.limit + 1}-{Math.min(filters.page * filters.limit, assignments.total)} dari {assignments.total} penugasan
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoadingTechnicians ? (
          <div className="col-span-3 text-center py-10">Loading technicians...</div>
        ) : technicians ? (
          technicians.map(technician => (
            <TechnicianCard
              key={technician.id}
              technician={technician}
              onViewAssignments={handleViewAssignments}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">Failed to load technicians</div>
        )}
      </div>
    </>
  );
}
