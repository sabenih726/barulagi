import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertTechnicianSchema, insertTicketSchema, 
  updateTicketSchema, filterTicketsSchema, dateRangeSchema,
  type InsertTicket, type UpdateTicket 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to handle validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return { data: schema.parse(data), error: null };
    } catch (error) {
      if (error instanceof ZodError) {
        return { data: null, error: fromZodError(error).message };
      }
      return { data: null, error: 'Validation error' };
    }
  };

  // User routes
  app.post('/api/users', async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertUserSchema, req.body);
    if (error) return res.status(400).json({ message: error });

    try {
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      const user = await storage.createUser(data);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    try {
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Technician routes
  app.post('/api/technicians', async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertTechnicianSchema, req.body);
    if (error) return res.status(400).json({ message: error });

    try {
      const user = await storage.getUser(data.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const technician = await storage.createTechnician(data);
      return res.status(201).json(technician);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create technician' });
    }
  });

  app.get('/api/technicians', async (_req: Request, res: Response) => {
    try {
      const technicians = await storage.getAllTechnicians();
      return res.json(technicians);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get technicians' });
    }
  });

  // Ticket routes
  app.post('/api/tickets', async (req: Request, res: Response) => {
    const { data, error } = validateRequest(insertTicketSchema, req.body);
    if (error) return res.status(400).json({ message: error });

    try {
      const ticket = await storage.createTicket(data as InsertTicket);
      
      // Add initial history entry
      await storage.addTicketHistory({
        ticketId: ticket.id,
        status: 'waiting',
        notes: 'Ticket created',
        updatedBy: data.createdBy
      });
      
      return res.status(201).json(ticket);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create ticket' });
    }
  });

  app.get('/api/tickets', async (req: Request, res: Response) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        facilityType: req.query.facilityType as string | undefined,
        priority: req.query.priority as string | undefined,
        search: req.query.search as string | undefined,
        technicianId: req.query.technicianId ? parseInt(req.query.technicianId as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const { data, error } = validateRequest(filterTicketsSchema, filters);
      if (error) return res.status(400).json({ message: error });

      const result = await storage.getTickets(data);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get tickets' });
    }
  });

  app.get('/api/tickets/recent', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const tickets = await storage.getRecentTickets(limit);
      return res.json(tickets);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get recent tickets' });
    }
  });

  app.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    try {
      const ticket = await storage.getTicket(id);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
      return res.json(ticket);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get ticket' });
    }
  });

  app.put('/api/tickets/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { data, error } = validateRequest(updateTicketSchema, req.body);
    if (error) return res.status(400).json({ message: error });

    try {
      const ticket = await storage.updateTicket(id, data as UpdateTicket);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
      
      // Add history entry if status is changed
      if (data.status) {
        await storage.addTicketHistory({
          ticketId: id,
          status: data.status,
          notes: req.body.notes || `Status updated to ${data.status}`,
          updatedBy: req.body.updatedBy
        });
      }
      
      return res.json(ticket);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to update ticket' });
    }
  });

  app.post('/api/tickets/:id/assign', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { technicianId, deadline, updatedBy } = req.body;
    if (!technicianId || !deadline || !updatedBy) {
      return res.status(400).json({ message: 'technicianId, deadline, and updatedBy are required' });
    }

    try {
      const ticket = await storage.assignTicket(id, technicianId, new Date(deadline));
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
      
      // Add history entry
      await storage.addTicketHistory({
        ticketId: id,
        status: 'in_progress',
        notes: req.body.notes || 'Ticket assigned to technician',
        updatedBy
      });
      
      return res.json(ticket);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to assign ticket' });
    }
  });

  app.post('/api/tickets/:id/complete', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { notes, updatedBy } = req.body;
    if (!notes || !updatedBy) {
      return res.status(400).json({ message: 'notes and updatedBy are required' });
    }

    try {
      const ticket = await storage.completeTicket(id, notes, updatedBy);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
      return res.json(ticket);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to complete ticket' });
    }
  });

  app.get('/api/tickets/:id/history', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    try {
      const history = await storage.getTicketHistory(id);
      return res.json(history);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get ticket history' });
    }
  });

  // Statistics routes
  app.get('/api/stats/dashboard', async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      return res.json(stats);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get dashboard stats' });
    }
  });

  app.get('/api/stats/categories', async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getCategoryStats();
      return res.json(stats);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get category stats' });
    }
  });

  app.get('/api/stats/trend', async (_req: Request, res: Response) => {
    try {
      const trend = await storage.getMonthlyTrend();
      return res.json(trend);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to get trend stats' });
    }
  });

  app.post('/api/stats/report', async (req: Request, res: Response) => {
    const { data, error } = validateRequest(dateRangeSchema, req.body);
    if (error) return res.status(400).json({ message: error });

    try {
      const summary = await storage.getReportSummary(data);
      return res.json(summary);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to generate report' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
