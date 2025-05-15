import { TechnicianWithStats } from "@shared/schema";

interface TechnicianCardProps {
  technician: TechnicianWithStats;
  onViewAssignments: (technicianId: number) => void;
}

export default function TechnicianCard({ 
  technician, 
  onViewAssignments 
}: TechnicianCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
          {technician.initials}
        </div>
        <div>
          <h4 className="font-medium">{technician.user.fullName}</h4>
          <p className="text-sm text-neutral-400">Teknisi {technician.specialization}</p>
        </div>
      </div>
      <div className="border-t border-neutral-100 pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-neutral-400">Tiket Aktif</span>
          <span className="text-sm font-medium">{technician.activeTickets}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-neutral-400">Tiket Selesai</span>
          <span className="text-sm font-medium">{technician.completedTickets}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-neutral-400">Rata-rata Penyelesaian</span>
          <span className="text-sm font-medium">{technician.averageCompletionTime.toFixed(1)} hari</span>
        </div>
      </div>
      <div className="mt-4">
        <button 
          onClick={() => onViewAssignments(technician.id)}
          className="w-full flex items-center justify-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5"
        >
          <span className="material-icons text-sm mr-1">assignment</span>
          Lihat Penugasan
        </button>
      </div>
    </div>
  );
}
