import { 
  users, technicians, tickets, ticketHistory,
  type User, type InsertUser, type Technician, type InsertTechnician,
  type Ticket, type InsertTicket, type UpdateTicket, type TicketHistory,
  type InsertTicketHistory, type FilterTickets, type DateRange,
  type DashboardStats, type CategoryStats, type MonthlyTrend,
  type TechnicianWithStats, type TicketWithTechnician, type ReportSummary
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, desc, asc, gte, lte, count, avg, sql } from "drizzle-orm";
import { format, differenceInDays, subMonths, parseISO } from "date-fns";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Technician methods
  getTechnician(id: number): Promise<Technician | undefined>;
  getAllTechnicians(): Promise<TechnicianWithStats[]>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;

  // Ticket methods
  getTicket(id: number): Promise<TicketWithTechnician | undefined>;
  getTickets(filters: FilterTickets): Promise<{ tickets: TicketWithTechnician[], total: number }>;
  getRecentTickets(limit: number): Promise<TicketWithTechnician[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: UpdateTicket): Promise<Ticket | undefined>;
  assignTicket(id: number, technicianId: number, deadline: Date): Promise<Ticket | undefined>;
  completeTicket(id: number, notes: string, userId: number): Promise<Ticket | undefined>;
  
  // Ticket history methods
  addTicketHistory(history: InsertTicketHistory): Promise<TicketHistory>;
  getTicketHistory(ticketId: number): Promise<TicketHistory[]>;
  
  // Statistics methods
  getDashboardStats(): Promise<DashboardStats>;
  getCategoryStats(): Promise<CategoryStats>;
  getMonthlyTrend(): Promise<MonthlyTrend[]>;
  getReportSummary(dateRange: DateRange): Promise<ReportSummary>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Technician methods
  async getTechnician(id: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    return technician;
  }

  async getAllTechnicians(): Promise<TechnicianWithStats[]> {
    const techs = await db.query.technicians.findMany({
      with: {
        user: true,
      },
      where: eq(technicians.active, true),
    });

    const result: TechnicianWithStats[] = [];

    for (const tech of techs) {
      // Get active tickets count
      const [activeTicketsResult] = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.technicianId, tech.id),
            or(
              eq(tickets.status, 'waiting'),
              eq(tickets.status, 'in_progress')
            )
          )
        );

      // Get completed tickets count
      const [completedTicketsResult] = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.technicianId, tech.id),
            eq(tickets.status, 'completed')
          )
        );

      // Calculate average completion time for completed tickets
      const completedTickets = await db
        .select({
          createdAt: tickets.createdAt,
          completedAt: tickets.completedAt,
        })
        .from(tickets)
        .where(
          and(
            eq(tickets.technicianId, tech.id),
            eq(tickets.status, 'completed')
          )
        );

      let avgTime = 0;
      if (completedTickets.length > 0) {
        const totalDays = completedTickets.reduce((acc, ticket) => {
          if (ticket.completedAt && ticket.createdAt) {
            return acc + differenceInDays(ticket.completedAt, ticket.createdAt);
          }
          return acc;
        }, 0);
        avgTime = totalDays / completedTickets.length;
      }

      result.push({
        ...tech,
        activeTickets: activeTicketsResult?.count || 0,
        completedTickets: completedTicketsResult?.count || 0,
        averageCompletionTime: parseFloat(avgTime.toFixed(1)),
      });
    }

    return result;
  }

  async createTechnician(insertTechnician: InsertTechnician): Promise<Technician> {
    const [technician] = await db
      .insert(technicians)
      .values(insertTechnician)
      .returning();
    return technician;
  }

  // Ticket methods
  async getTicket(id: number): Promise<TicketWithTechnician | undefined> {
    return await db.query.tickets.findFirst({
      where: eq(tickets.id, id),
      with: {
        technician: {
          with: {
            user: true
          }
        },
        createdByUser: true
      }
    }) as TicketWithTechnician | undefined;
  }

  async getTickets(filters: FilterTickets): Promise<{ tickets: TicketWithTechnician[], total: number }> {
    const { status, facilityType, priority, search, technicianId, page = 1, limit = 10 } = filters;
    
    try {
      // Buat kondisi WHERE untuk query
      let whereCondition: any = {};
      
      // Hanya terapkan filter jika nilai bukan 'all'
      if (status && status !== 'all') {
        whereCondition.status = status;
      }
      
      if (facilityType && facilityType !== 'all') {
        whereCondition.facilityType = facilityType;
      }
      
      if (priority && priority !== 'all') {
        whereCondition.priority = priority;
      }
      
      if (technicianId) {
        whereCondition.technicianId = technicianId;
      }
      
      // Untuk pencarian text, kita perlu logika OR
      if (search) {
        whereCondition = {
          ...whereCondition,
          OR: [
            { ticketNumber: { contains: search } },
            { facilityName: { contains: search } },
            { location: { contains: search } }
          ]
        };
      }
      
      const offset = (page - 1) * limit;
      
      // Dapatkan total jumlah hasil
      const countQuery = db.select({ count: count() }).from(tickets);
      if (Object.keys(whereCondition).length > 0) {
        // Terapkan kondisi WHERE secara manual
        if (whereCondition.status) {
          countQuery.where(eq(tickets.status, whereCondition.status as any));
        }
        if (whereCondition.facilityType) {
          countQuery.where(eq(tickets.facilityType, whereCondition.facilityType as any));
        }
        if (whereCondition.priority) {
          countQuery.where(eq(tickets.priority, whereCondition.priority as any));
        }
        if (whereCondition.technicianId) {
          countQuery.where(eq(tickets.technicianId, whereCondition.technicianId));
        }
        // Handle search condition if exists
        if (whereCondition.OR) {
          countQuery.where(
            or(
              like(tickets.ticketNumber, `%${search}%`),
              like(tickets.facilityName, `%${search}%`),
              like(tickets.location, `%${search}%`)
            )
          );
        }
      }
      
      const [countResult] = await countQuery;
      const totalCount = countResult?.count || 0;
      
      // Buat query untuk data tiket
      let ticketsData: TicketWithTechnician[] = [];
      
      try {
        // Dapatkan semua tiket
        const allTickets = await db.select().from(tickets)
          .orderBy(desc(tickets.createdAt))
          .limit(limit)
          .offset(offset);
          
        // Filter secara manual jika perlu
        let filteredTickets = allTickets;
        if (whereCondition.status) {
          filteredTickets = filteredTickets.filter(ticket => ticket.status === whereCondition.status);
        }
        if (whereCondition.facilityType) {
          filteredTickets = filteredTickets.filter(ticket => ticket.facilityType === whereCondition.facilityType);
        }
        if (whereCondition.priority) {
          filteredTickets = filteredTickets.filter(ticket => ticket.priority === whereCondition.priority);
        }
        if (whereCondition.technicianId) {
          filteredTickets = filteredTickets.filter(ticket => ticket.technicianId === whereCondition.technicianId);
        }
        if (search) {
          filteredTickets = filteredTickets.filter(ticket => 
            ticket.ticketNumber.includes(search) || 
            ticket.facilityName.includes(search) || 
            ticket.location.includes(search)
          );
        }
        
        // Ambil data technician dan user untuk tiap ticket
        ticketsData = await Promise.all(filteredTickets.map(async (ticket) => {
          let technicianData = null;
          if (ticket.technicianId) {
            technicianData = await db.query.technicians.findFirst({
              where: eq(technicians.id, ticket.technicianId),
              with: {
                user: true
              }
            });
          }
          
          const createdByUser = await db.query.users.findFirst({
            where: eq(users.id, ticket.createdBy)
          });
          
          return {
            ...ticket,
            technician: technicianData,
            createdByUser: createdByUser!
          } as TicketWithTechnician;
        }));
      } catch (error) {
        console.error('Error fetching tickets data:', error);
      }
      
      return {
        tickets: ticketsData,
        total: totalCount
      };
    } catch (error) {
      console.error('Error getting tickets:', error);
      throw error;
    }
  }

  async getRecentTickets(limit: number): Promise<TicketWithTechnician[]> {
    return await db.query.tickets.findMany({
      with: {
        technician: {
          with: {
            user: true
          }
        },
        createdByUser: true
      },
      orderBy: desc(tickets.createdAt),
      limit
    }) as TicketWithTechnician[];
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    // Generate ticket number: TK-{4 digits}
    const [lastTicket] = await db
      .select({ ticketNumber: tickets.ticketNumber })
      .from(tickets)
      .orderBy(desc(tickets.id))
      .limit(1);
    
    let newTicketNumber = 'TK-1000';
    
    if (lastTicket) {
      const lastNumber = parseInt(lastTicket.ticketNumber.split('-')[1]);
      newTicketNumber = `TK-${lastNumber + 1}`;
    }
    
    const [ticket] = await db
      .insert(tickets)
      .values({ 
        ...insertTicket, 
        ticketNumber: newTicketNumber,
        status: insertTicket.status || 'waiting'
      })
      .returning();
    
    return ticket;
  }

  async updateTicket(id: number, updateTicket: UpdateTicket): Promise<Ticket | undefined> {
    const [ticket] = await db
      .update(tickets)
      .set({ 
        ...updateTicket,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    
    return ticket;
  }

  async assignTicket(id: number, technicianId: number, deadline: Date): Promise<Ticket | undefined> {
    const [ticket] = await db
      .update(tickets)
      .set({ 
        technicianId,
        status: 'in_progress',
        deadline,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    
    return ticket;
  }

  async completeTicket(id: number, notes: string, userId: number): Promise<Ticket | undefined> {
    const [ticket] = await db
      .update(tickets)
      .set({ 
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    
    if (ticket) {
      await this.addTicketHistory({
        ticketId: id,
        status: 'completed',
        notes,
        updatedBy: userId
      });
    }
    
    return ticket;
  }

  // Ticket history methods
  async addTicketHistory(history: InsertTicketHistory): Promise<TicketHistory> {
    const [entry] = await db
      .insert(ticketHistory)
      .values(history)
      .returning();
    
    return entry;
  }

  async getTicketHistory(ticketId: number): Promise<TicketHistory[]> {
    return await db
      .select()
      .from(ticketHistory)
      .where(eq(ticketHistory.ticketId, ticketId))
      .orderBy(desc(ticketHistory.createdAt));
  }

  // Statistics methods
  async getDashboardStats(): Promise<DashboardStats> {
    // Current period stats
    const [totalTickets] = await db
      .select({ count: count() })
      .from(tickets);
    
    const [pendingTickets] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, 'waiting'));
    
    const [inProgressTickets] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, 'in_progress'));
    
    const [completedTickets] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.status, 'completed'));
    
    // Previous period stats (1 month ago)
    const oneMonthAgo = subMonths(new Date(), 1);
    
    const [totalTicketsPrev] = await db
      .select({ count: count() })
      .from(tickets)
      .where(lte(tickets.createdAt, oneMonthAgo));
    
    const [pendingTicketsPrev] = await db
      .select({ count: count() })
      .from(tickets)
      .where(
        and(
          eq(tickets.status, 'waiting'),
          lte(tickets.createdAt, oneMonthAgo)
        )
      );
    
    const [inProgressTicketsPrev] = await db
      .select({ count: count() })
      .from(tickets)
      .where(
        and(
          eq(tickets.status, 'in_progress'),
          lte(tickets.createdAt, oneMonthAgo)
        )
      );
    
    const [completedTicketsPrev] = await db
      .select({ count: count() })
      .from(tickets)
      .where(
        and(
          eq(tickets.status, 'completed'),
          lte(tickets.createdAt, oneMonthAgo)
        )
      );
    
    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    return {
      totalTickets: totalTickets?.count || 0,
      pendingTickets: pendingTickets?.count || 0,
      inProgressTickets: inProgressTickets?.count || 0,
      completedTickets: completedTickets?.count || 0,
      totalChange: calculatePercentageChange(
        totalTickets?.count || 0,
        totalTicketsPrev?.count || 0
      ),
      pendingChange: calculatePercentageChange(
        pendingTickets?.count || 0,
        pendingTicketsPrev?.count || 0
      ),
      inProgressChange: calculatePercentageChange(
        inProgressTickets?.count || 0,
        inProgressTicketsPrev?.count || 0
      ),
      completedChange: calculatePercentageChange(
        completedTickets?.count || 0,
        completedTicketsPrev?.count || 0
      )
    };
  }

  async getCategoryStats(): Promise<CategoryStats> {
    const [electrical] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.facilityType, 'electrical'));
    
    const [plumbing] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.facilityType, 'plumbing'));
    
    const [ac] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.facilityType, 'ac'));
    
    const [furniture] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.facilityType, 'furniture'));
    
    const [it] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.facilityType, 'it'));
    
    const [other] = await db
      .select({ count: count() })
      .from(tickets)
      .where(eq(tickets.facilityType, 'other'));
    
    return {
      electrical: electrical?.count || 0,
      plumbing: plumbing?.count || 0,
      ac: ac?.count || 0,
      furniture: furniture?.count || 0,
      it: it?.count || 0,
      other: other?.count || 0
    };
  }

  async getMonthlyTrend(): Promise<MonthlyTrend[]> {
    // Get data for the last 6 months
    const result: MonthlyTrend[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const [waiting] = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.status, 'waiting'),
            gte(tickets.createdAt, monthStart),
            lte(tickets.createdAt, monthEnd)
          )
        );
      
      const [inProgress] = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.status, 'in_progress'),
            gte(tickets.createdAt, monthStart),
            lte(tickets.createdAt, monthEnd)
          )
        );
      
      const [completed] = await db
        .select({ count: count() })
        .from(tickets)
        .where(
          and(
            eq(tickets.status, 'completed'),
            gte(tickets.createdAt, monthStart),
            lte(tickets.createdAt, monthEnd)
          )
        );
      
      result.push({
        month: format(month, 'MMM yyyy'),
        waiting: waiting?.count || 0,
        inProgress: inProgress?.count || 0,
        completed: completed?.count || 0
      });
    }
    
    return result;
  }

  async getReportSummary(dateRange: DateRange): Promise<ReportSummary> {
    const { startDate, endDate, facilityType, status } = dateRange;
    const startDateObj = parseISO(startDate);
    const endDateObj = parseISO(endDate);
    
    // Build filter conditions
    const conditions = [
      gte(tickets.createdAt, startDateObj),
      lte(tickets.createdAt, endDateObj)
    ];
    
    if (facilityType) {
      conditions.push(eq(tickets.facilityType, facilityType));
    }
    
    if (status) {
      conditions.push(eq(tickets.status, status));
    }
    
    // Get total tickets for the period
    const [totalTickets] = await db
      .select({ count: count() })
      .from(tickets)
      .where(and(...conditions));
    
    // Calculate average completion time for completed tickets
    const completedTickets = await db
      .select({
        createdAt: tickets.createdAt,
        completedAt: tickets.completedAt,
        deadline: tickets.deadline
      })
      .from(tickets)
      .where(
        and(
          eq(tickets.status, 'completed'),
          ...conditions
        )
      );
    
    let avgCompletionDays = 0;
    let onTimeCount = 0;
    
    if (completedTickets.length > 0) {
      const totalDays = completedTickets.reduce((acc, ticket) => {
        if (ticket.completedAt && ticket.createdAt) {
          return acc + differenceInDays(ticket.completedAt, ticket.createdAt);
        }
        return acc;
      }, 0);
      
      // Count tickets completed on time
      completedTickets.forEach(ticket => {
        if (ticket.completedAt && ticket.deadline && ticket.completedAt <= ticket.deadline) {
          onTimeCount++;
        }
      });
      
      avgCompletionDays = totalDays / completedTickets.length;
    }
    
    // Calculate technician efficiency
    const technicianEfficiency = completedTickets.length > 0 
      ? Math.round((onTimeCount / completedTickets.length) * 100) 
      : 0;
    
    // Format strings for display
    const onTimePercentage = completedTickets.length > 0 
      ? `${Math.round((onTimeCount / completedTickets.length) * 100)}%` 
      : "0%";
    
    return {
      totalTickets: totalTickets?.count || 0,
      avgCompletionTime: `${avgCompletionDays.toFixed(1)} hari`,
      onTimePercentage,
      technicianEfficiency: `${technicianEfficiency}%`
    };
  }
}

export const storage = new DatabaseStorage();
