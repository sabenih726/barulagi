import { 
  Ticket, 
  Technician, 
  User, 
  TicketHistory, 
  TicketWithTechnician,
  FilterTickets
} from '@shared/schema';

// Constants for localStorage keys
const KEYS = {
  TICKETS: 'tiketFacility_tickets',
  USERS: 'tiketFacility_users',
  TECHNICIANS: 'tiketFacility_technicians',
  TICKET_HISTORY: 'tiketFacility_ticketHistory'
};

// Initialize with sample data if storage is empty
const initializeStorage = () => {
  // Admin user
  if (!localStorage.getItem(KEYS.USERS)) {
    const users: User[] = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123', // In real app use hashed password
        fullName: 'Administrator',
        role: 'admin'
      },
      {
        id: 2,
        username: 'teknisi1',
        password: 'teknisi123',
        fullName: 'Ahmad Teknisi',
        role: 'technician'
      },
      {
        id: 3,
        username: 'teknisi2',
        password: 'teknisi123',
        fullName: 'Budi Santoso',
        role: 'technician'
      }
    ];
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }

  // Technicians
  if (!localStorage.getItem(KEYS.TECHNICIANS)) {
    const technicians: Technician[] = [
      {
        id: 1,
        userId: 2,
        specialization: 'Electrical & IT',
        initials: 'AT',
        active: true
      },
      {
        id: 2,
        userId: 3,
        specialization: 'Plumbing & AC',
        initials: 'BS',
        active: true
      }
    ];
    localStorage.setItem(KEYS.TECHNICIANS, JSON.stringify(technicians));
  }
  
  // Sample tickets
  if (!localStorage.getItem(KEYS.TICKETS)) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const tickets: Ticket[] = [
      {
        id: 1,
        ticketNumber: 'TK-1001',
        facilityType: 'electrical',
        facilityName: 'Lampu Koridor Lantai 2',
        location: 'Gedung A, Lantai 2',
        description: 'Lampu koridor mati sejak kemarin sore',
        priority: 'medium',
        status: 'completed',
        createdBy: 1,
        createdAt: twoWeeksAgo.toISOString(),
        technicianId: 1,
        deadline: new Date(twoWeeksAgo.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(twoWeeksAgo.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(twoWeeksAgo.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        ticketNumber: 'TK-1002',
        facilityType: 'plumbing',
        facilityName: 'Wastafel Toilet Wanita',
        location: 'Gedung B, Lantai 1',
        description: 'Wastafel bocor dan air menggenang di lantai',
        priority: 'high',
        status: 'in_progress',
        createdBy: 1,
        createdAt: oneWeekAgo.toISOString(),
        technicianId: 2,
        deadline: new Date(oneWeekAgo.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: oneWeekAgo.toISOString(),
        completedAt: null
      },
      {
        id: 3,
        ticketNumber: 'TK-1003',
        facilityType: 'ac',
        facilityName: 'AC Ruang Rapat Utama',
        location: 'Gedung A, Lantai 3',
        description: 'AC tidak dingin dan mengeluarkan bunyi berisik',
        priority: 'medium',
        status: 'waiting',
        createdBy: 1,
        createdAt: now.toISOString(),
        technicianId: null,
        deadline: null,
        updatedAt: now.toISOString(),
        completedAt: null
      },
      {
        id: 4,
        ticketNumber: 'TK-1004',
        facilityType: 'it',
        facilityName: 'Proyektor Ruang Meeting',
        location: 'Gedung C, Lantai 2',
        description: 'Proyektor tidak bisa terhubung dengan laptop',
        priority: 'low',
        status: 'waiting',
        createdBy: 1,
        createdAt: now.toISOString(),
        technicianId: null,
        deadline: null,
        updatedAt: now.toISOString(),
        completedAt: null
      }
    ];
    
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
  }
  
  // Ticket history
  if (!localStorage.getItem(KEYS.TICKET_HISTORY)) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const ticketHistory: TicketHistory[] = [
      {
        id: 1,
        ticketId: 1,
        status: 'waiting',
        notes: 'Ticket created',
        timestamp: twoWeeksAgo.toISOString(),
        updatedBy: 1
      },
      {
        id: 2,
        ticketId: 1,
        status: 'in_progress',
        notes: 'Assigned to technician',
        timestamp: new Date(twoWeeksAgo.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        updatedBy: 1
      },
      {
        id: 3,
        ticketId: 1,
        status: 'completed',
        notes: 'Lampu telah diperbaiki dan diganti dengan yang baru',
        timestamp: new Date(twoWeeksAgo.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        updatedBy: 2
      },
      {
        id: 4,
        ticketId: 2,
        status: 'waiting',
        notes: 'Ticket created',
        timestamp: oneWeekAgo.toISOString(),
        updatedBy: 1
      },
      {
        id: 5,
        ticketId: 2,
        status: 'in_progress',
        notes: 'Assigned to technician',
        timestamp: new Date(oneWeekAgo.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        updatedBy: 1
      },
      {
        id: 6,
        ticketId: 3,
        status: 'waiting',
        notes: 'Ticket created',
        timestamp: now.toISOString(),
        updatedBy: 1
      },
      {
        id: 7,
        ticketId: 4,
        status: 'waiting',
        notes: 'Ticket created',
        timestamp: now.toISOString(),
        updatedBy: 1
      }
    ];
    
    localStorage.setItem(KEYS.TICKET_HISTORY, JSON.stringify(ticketHistory));
  }
};

// Helper functions to get and save data
const getData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// User functions
export const getUsers = (): User[] => {
  return getData<User>(KEYS.USERS);
};

export const getUserById = (id: number): User | undefined => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

export const createUser = (user: Omit<User, 'id'>): User => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
  };
  
  users.push(newUser);
  saveData(KEYS.USERS, users);
  return newUser;
};

// Technician functions
export const getTechnicians = (): Technician[] => {
  return getData<Technician>(KEYS.TECHNICIANS);
};

export const getTechnicianById = (id: number): Technician | undefined => {
  const technicians = getTechnicians();
  return technicians.find(tech => tech.id === id);
};

export const createTechnician = (technician: Omit<Technician, 'id'>): Technician => {
  const technicians = getTechnicians();
  const newTechnician = {
    ...technician,
    id: technicians.length > 0 ? Math.max(...technicians.map(t => t.id)) + 1 : 1
  };
  
  technicians.push(newTechnician);
  saveData(KEYS.TECHNICIANS, technicians);
  return newTechnician;
};

// Get technicians with stats
export const getTechniciansWithStats = (): any[] => {
  const technicians = getTechnicians();
  const users = getUsers();
  const tickets = getTickets();
  
  return technicians.map(tech => {
    const user = users.find(u => u.id === tech.userId);
    
    // Active tickets
    const activeTickets = tickets.filter(
      t => t.technicianId === tech.id && (t.status === 'waiting' || t.status === 'in_progress')
    ).length;
    
    // Completed tickets
    const completedTickets = tickets.filter(
      t => t.technicianId === tech.id && t.status === 'completed'
    ).length;
    
    // Calculate average completion time
    const completedTicketList = tickets.filter(
      t => t.technicianId === tech.id && t.status === 'completed' && t.completedAt
    );
    
    let avgTime = 0;
    if (completedTicketList.length > 0) {
      const totalTime = completedTicketList.reduce((sum, ticket) => {
        const createdDate = new Date(ticket.createdAt);
        const completedDate = new Date(ticket.completedAt!);
        return sum + (completedDate.getTime() - createdDate.getTime());
      }, 0);
      
      // Average in hours
      avgTime = totalTime / completedTicketList.length / (1000 * 60 * 60);
    }
    
    return {
      ...tech,
      user: user!,
      activeTickets,
      completedTickets,
      averageCompletionTime: parseFloat(avgTime.toFixed(1))
    };
  });
};

// Ticket functions
export const getTickets = (): Ticket[] => {
  return getData<Ticket>(KEYS.TICKETS);
};

export const getTicketById = (id: number): Ticket | undefined => {
  const tickets = getTickets();
  return tickets.find(ticket => ticket.id === id);
};

// Get ticket with technician data
export const getTicketWithTechnician = (id: number): TicketWithTechnician | undefined => {
  const ticket = getTicketById(id);
  if (!ticket) return undefined;
  
  const technicians = getTechnicians();
  const users = getUsers();
  
  const technician = ticket.technicianId ? technicians.find(t => t.id === ticket.technicianId) : undefined;
  const techUser = technician?.userId ? users.find(u => u.id === technician.userId) : undefined;
  
  const createdByUser = users.find(u => u.id === ticket.createdBy);
  
  return {
    ...ticket,
    technician: technician ? {
      ...technician,
      user: techUser!
    } : undefined,
    createdByUser: createdByUser!
  };
};

// Filter and paginate tickets
export const filterTickets = (filters: FilterTickets): { tickets: TicketWithTechnician[], total: number } => {
  const allTickets = getTickets();
  const users = getUsers();
  const technicians = getTechnicians();
  
  // Apply filters
  let filteredTickets = [...allTickets];
  
  if (filters.status && filters.status !== 'all') {
    filteredTickets = filteredTickets.filter(t => t.status === filters.status);
  }
  
  if (filters.facilityType && filters.facilityType !== 'all') {
    filteredTickets = filteredTickets.filter(t => t.facilityType === filters.facilityType);
  }
  
  if (filters.priority && filters.priority !== 'all') {
    filteredTickets = filteredTickets.filter(t => t.priority === filters.priority);
  }
  
  if (filters.technicianId) {
    filteredTickets = filteredTickets.filter(t => t.technicianId === filters.technicianId);
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filteredTickets = filteredTickets.filter(t => 
      t.ticketNumber.toLowerCase().includes(search) ||
      t.facilityName.toLowerCase().includes(search) ||
      t.location.toLowerCase().includes(search)
    );
  }
  
  // Sort by created date (newest first)
  filteredTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Get total before pagination
  const total = filteredTickets.length;
  
  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  const paginatedTickets = filteredTickets.slice(start, end);
  
  // Add technician and user data
  const ticketsWithTechnician: TicketWithTechnician[] = paginatedTickets.map(ticket => {
    const technician = ticket.technicianId ? technicians.find(t => t.id === ticket.technicianId) : undefined;
    const techUser = technician?.userId ? users.find(u => u.id === technician.userId) : undefined;
    const createdByUser = users.find(u => u.id === ticket.createdBy);
    
    return {
      ...ticket,
      technician: technician && techUser ? {
        ...technician,
        user: techUser
      } : undefined,
      createdByUser: createdByUser!
    };
  });
  
  return {
    tickets: ticketsWithTechnician,
    total
  };
};

// Get recent tickets
export const getRecentTickets = (limit: number): TicketWithTechnician[] => {
  const tickets = getTickets();
  const users = getUsers();
  const technicians = getTechnicians();
  
  // Sort by created date (newest first)
  tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Get the most recent tickets
  const recentTickets = tickets.slice(0, limit);
  
  // Add technician and user data
  return recentTickets.map(ticket => {
    const technician = ticket.technicianId ? technicians.find(t => t.id === ticket.technicianId) : undefined;
    const techUser = technician?.userId ? users.find(u => u.id === technician.userId) : undefined;
    const createdByUser = users.find(u => u.id === ticket.createdBy);
    
    return {
      ...ticket,
      technician: technician && techUser ? {
        ...technician,
        user: techUser
      } : undefined,
      createdByUser: createdByUser!
    };
  });
};

// Create a new ticket
export const createTicket = (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>): Ticket => {
  const tickets = getTickets();
  
  // Generate ticket number: TK-{4 digits}
  let newTicketNumber = 'TK-1000';
  if (tickets.length > 0) {
    const lastTicket = tickets.reduce((max, ticket) => (
      parseInt(ticket.ticketNumber.split('-')[1]) > parseInt(max.ticketNumber.split('-')[1])
        ? ticket : max
    ), tickets[0]);
    
    const lastNumber = parseInt(lastTicket.ticketNumber.split('-')[1]);
    newTicketNumber = `TK-${lastNumber + 1}`;
  }
  
  const newTicket: Ticket = {
    ...ticket as any,
    id: tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1,
    ticketNumber: newTicketNumber,
    createdAt: new Date().toISOString(),
    status: 'waiting',
    updatedAt: new Date().toISOString(),
    completedAt: null
  };
  
  tickets.push(newTicket);
  saveData(KEYS.TICKETS, tickets);
  
  // Add ticket history
  addTicketHistory({
    ticketId: newTicket.id,
    status: 'waiting',
    notes: 'Ticket created',
    updatedBy: ticket.createdBy
  });
  
  return newTicket;
};

// Update ticket
export const updateTicket = (id: number, updates: Partial<Ticket>): Ticket | undefined => {
  const tickets = getTickets();
  const index = tickets.findIndex(t => t.id === id);
  
  if (index === -1) return undefined;
  
  const updatedTicket = {
    ...tickets[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  tickets[index] = updatedTicket;
  saveData(KEYS.TICKETS, tickets);
  
  return updatedTicket;
};

// Assign ticket to technician
export const assignTicket = (id: number, technicianId: number, deadline: string): Ticket | undefined => {
  const ticket = updateTicket(id, {
    technicianId,
    deadline,
    status: 'in_progress'
  });
  
  if (ticket) {
    // Add history entry
    addTicketHistory({
      ticketId: id,
      status: 'in_progress',
      notes: `Assigned to technician ID: ${technicianId}`,
      updatedBy: 1 // Assuming admin is making the assignment
    });
  }
  
  return ticket;
};

// Complete ticket
export const completeTicket = (id: number, notes: string, userId: number): Ticket | undefined => {
  const ticket = updateTicket(id, {
    status: 'completed',
    completedAt: new Date().toISOString()
  });
  
  if (ticket) {
    // Add history entry
    addTicketHistory({
      ticketId: id,
      status: 'completed',
      notes,
      updatedBy: userId
    });
  }
  
  return ticket;
};

// Ticket history functions
export const getTicketHistory = (): TicketHistory[] => {
  return getData<TicketHistory>(KEYS.TICKET_HISTORY);
};

export const getTicketHistoryByTicketId = (ticketId: number): TicketHistory[] => {
  const history = getTicketHistory();
  return history.filter(h => h.ticketId === ticketId);
};

export const addTicketHistory = (history: Omit<TicketHistory, 'id' | 'timestamp'>): TicketHistory => {
  const ticketHistory = getTicketHistory();
  
  const newHistory: TicketHistory = {
    ...history,
    id: ticketHistory.length > 0 ? Math.max(...ticketHistory.map(h => h.id)) + 1 : 1,
    timestamp: new Date().toISOString()
  };
  
  ticketHistory.push(newHistory);
  saveData(KEYS.TICKET_HISTORY, ticketHistory);
  
  return newHistory;
};

// Dashboard statistics
export const getDashboardStats = () => {
  const tickets = getTickets();
  
  // Calculate stats for current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Current month tickets
  const currentMonthTickets = tickets.filter(ticket => {
    const date = new Date(ticket.createdAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  // Last month tickets
  const lastMonthTickets = tickets.filter(ticket => {
    const date = new Date(ticket.createdAt);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });
  
  // Calculate totals
  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter(t => t.status === 'waiting').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const completedTickets = tickets.filter(t => t.status === 'completed').length;
  
  // Calculate last month totals
  const lastMonthTotal = lastMonthTickets.length;
  const lastMonthPending = lastMonthTickets.filter(t => t.status === 'waiting').length;
  const lastMonthInProgress = lastMonthTickets.filter(t => t.status === 'in_progress').length;
  const lastMonthCompleted = lastMonthTickets.filter(t => t.status === 'completed').length;
  
  // Calculate changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  return {
    totalTickets,
    pendingTickets,
    inProgressTickets,
    completedTickets,
    totalChange: calculateChange(totalTickets, lastMonthTotal),
    pendingChange: calculateChange(pendingTickets, lastMonthPending),
    inProgressChange: calculateChange(inProgressTickets, lastMonthInProgress),
    completedChange: calculateChange(completedTickets, lastMonthCompleted)
  };
};

// Category statistics
export const getCategoryStats = () => {
  const tickets = getTickets();
  
  // Count tickets by facility type
  return {
    electrical: tickets.filter(t => t.facilityType === 'electrical').length,
    plumbing: tickets.filter(t => t.facilityType === 'plumbing').length,
    ac: tickets.filter(t => t.facilityType === 'ac').length,
    furniture: tickets.filter(t => t.facilityType === 'furniture').length,
    it: tickets.filter(t => t.facilityType === 'it').length,
    other: tickets.filter(t => t.facilityType === 'other').length
  };
};

// Monthly trend
export const getMonthlyTrend = () => {
  const tickets = getTickets();
  const now = new Date();
  
  // Get data for the last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(month);
  }
  
  return months.map(month => {
    const monthName = month.toLocaleString('default', { month: 'short' });
    const year = month.getFullYear();
    const monthText = `${monthName} ${year}`;
    
    // Filter tickets for this month
    const monthTickets = tickets.filter(ticket => {
      const date = new Date(ticket.createdAt);
      return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
    });
    
    return {
      month: monthText,
      waiting: monthTickets.filter(t => t.status === 'waiting').length,
      inProgress: monthTickets.filter(t => t.status === 'in_progress').length,
      completed: monthTickets.filter(t => t.status === 'completed').length
    };
  });
};

// Report summary
export const getReportSummary = (dateRange: { startDate: string, endDate: string, facilityType?: string, status?: string }) => {
  const tickets = getTickets();
  
  // Filter tickets by date range
  let filteredTickets = tickets.filter(ticket => {
    const ticketDate = new Date(ticket.createdAt);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // Include the end date fully
    
    return ticketDate >= startDate && ticketDate <= endDate;
  });
  
  // Apply additional filters
  if (dateRange.facilityType && dateRange.facilityType !== 'all') {
    filteredTickets = filteredTickets.filter(t => t.facilityType === dateRange.facilityType);
  }
  
  if (dateRange.status && dateRange.status !== 'all') {
    filteredTickets = filteredTickets.filter(t => t.status === dateRange.status);
  }
  
  // Calculate total tickets
  const totalTickets = filteredTickets.length;
  
  // Calculate average completion time for completed tickets
  const completedTickets = filteredTickets.filter(t => t.status === 'completed' && t.completedAt);
  let avgCompletionTime = 0;
  
  if (completedTickets.length > 0) {
    const totalTime = completedTickets.reduce((sum, ticket) => {
      const createdDate = new Date(ticket.createdAt);
      const completedDate = new Date(ticket.completedAt!);
      return sum + (completedDate.getTime() - createdDate.getTime());
    }, 0);
    
    // Average in hours
    avgCompletionTime = totalTime / completedTickets.length / (1000 * 60 * 60);
  }
  
  // Calculate on-time percentage
  const ticketsWithDeadline = filteredTickets.filter(t => t.deadline);
  let onTimePercentage = 0;
  
  if (ticketsWithDeadline.length > 0) {
    const onTimeTickets = ticketsWithDeadline.filter(t => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      
      const deadlineDate = new Date(t.deadline!);
      const completedDate = new Date(t.completedAt);
      return completedDate <= deadlineDate;
    });
    
    onTimePercentage = (onTimeTickets.length / ticketsWithDeadline.length) * 100;
  }
  
  // Calculate technician efficiency
  const technicianIds = [...new Set(filteredTickets.filter(t => t.technicianId).map(t => t.technicianId))];
  let technicianEfficiency = 0;
  
  if (technicianIds.length > 0) {
    const efficiencySum = technicianIds.reduce((sum, techId) => {
      const techTickets = filteredTickets.filter(t => t.technicianId === techId);
      const completedTechTickets = techTickets.filter(t => t.status === 'completed');
      return sum + (completedTechTickets.length / techTickets.length);
    }, 0);
    
    technicianEfficiency = (efficiencySum / technicianIds.length) * 100;
  }
  
  return {
    totalTickets,
    avgCompletionTime: `${avgCompletionTime.toFixed(1)} jam`,
    onTimePercentage: `${onTimePercentage.toFixed(1)}%`,
    technicianEfficiency: `${technicianEfficiency.toFixed(1)}%`
  };
};

// Initialize storage when the module is imported
if (typeof window !== 'undefined') {
  initializeStorage();
}