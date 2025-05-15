import { useState } from "react";
import { format } from "date-fns";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import Pagination from "./Pagination";
import { Ticket, TicketWithTechnician } from "@shared/schema";

interface TicketTableProps {
  tickets: TicketWithTechnician[];
  totalTickets: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  showActions?: boolean;
  showTechnician?: boolean;
  emptyMessage?: string;
  onViewTicket?: (ticket: TicketWithTechnician) => void;
  onEditTicket?: (ticket: TicketWithTechnician) => void;
}

export default function TicketTable({ 
  tickets, 
  totalTickets,
  page,
  limit,
  onPageChange,
  showActions = true,
  showTechnician = true,
  emptyMessage = "Tidak ada tiket yang ditemukan",
  onViewTicket,
  onEditTicket
}: TicketTableProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-neutral-400">
              <th className="pb-3 font-medium">ID Tiket</th>
              <th className="pb-3 font-medium">Fasilitas</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Tanggal Dibuat</th>
              <th className="pb-3 font-medium">Prioritas</th>
              {showTechnician && <th className="pb-3 font-medium">Teknisi</th>}
              {showActions && <th className="pb-3 font-medium">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="text-sm border-t border-neutral-100">
                  <td className="py-3 pr-4">
                    <span className="font-medium text-primary">{ticket.ticketNumber}</span>
                  </td>
                  <td className="py-3 pr-4">{ticket.facilityName}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-3 pr-4">
                    {format(new Date(ticket.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-3 pr-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  {showTechnician && (
                    <td className="py-3 pr-4">
                      {ticket.technician ? ticket.technician.user.fullName : '-'}
                    </td>
                  )}
                  {showActions && (
                    <td className="py-3">
                      <div className="flex space-x-1">
                        {onViewTicket && (
                          <button 
                            onClick={() => onViewTicket(ticket)}
                            className="p-1 rounded hover:bg-neutral-100"
                          >
                            <span className="material-icons text-neutral-400 text-sm">visibility</span>
                          </button>
                        )}
                        {onEditTicket && (
                          <button 
                            onClick={() => onEditTicket(ticket)}
                            className="p-1 rounded hover:bg-neutral-100"
                          >
                            <span className="material-icons text-neutral-400 text-sm">edit</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={showActions ? (showTechnician ? 7 : 6) : (showTechnician ? 6 : 5)} 
                  className="py-4 text-center text-neutral-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalTickets > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-neutral-400">
            Menampilkan {(page - 1) * limit + 1}-{Math.min(page * limit, totalTickets)} dari {totalTickets} tiket
          </div>
          
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(totalTickets / limit)}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
