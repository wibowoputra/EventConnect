import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertUserSchema, insertEventSchema, insertRegistrationSchema, insertCommunitySchema, insertCommunityMemberSchema, insertRacePackSchema, insertParticipantCheckpointSchema } from "../shared/schema.js";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { login, authenticateToken, requireRole, AuthRequest } from "./auth.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler for Zod validation
  const validateRequest = (schema: any, body: any) => {
    try {
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        throw new Error(validationError.message);
      }
      throw error;
    }
  };

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const result = await login(username, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  // Protected routes
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users", authenticateToken, requireRole("admin"), async (req: Request, res: Response) => {
    const users = await storage.getAllUsers();
    // Don't send passwords
    const safeUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(safeUsers);
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = validateRequest(insertUserSchema, req.body);
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only allow update of certain fields
      const { username, email, fullName, role, avatar } = req.body;
      const updatedUser = await storage.updateUser(id, { 
        username, 
        email, 
        fullName, 
        role, 
        avatar 
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      // Don't send password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Event routes
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      // Filter by organizer if provided
      const organizerId = req.query.organizerId ? parseInt(req.query.organizerId as string) : undefined;
      // Filter by status if provided
      const status = req.query.status as string | undefined;
      
      let events;
      if (organizerId) {
        events = await storage.getEventsByOrganizer(organizerId);
      } else if (status) {
        events = await storage.getEventsByStatus(status);
      } else {
        events = await storage.getAllEvents();
      }
      
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/events", async (req: Request, res: Response) => {
    try {
      const eventData = validateRequest(insertEventSchema, req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const updatedEvent = await storage.updateEvent(id, req.body);
      
      if (!updatedEvent) {
        return res.status(500).json({ message: "Failed to update event" });
      }
      
      res.json(updatedEvent);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const deleted = await storage.deleteEvent(id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete event" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Registration routes
  app.get("/api/registrations", async (req: Request, res: Response) => {
    try {
      // Filter by event if provided
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      // Filter by user if provided
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let registrations;
      if (eventId) {
        registrations = await storage.getRegistrationsByEvent(eventId);
      } else if (userId) {
        registrations = await storage.getRegistrationsByUser(userId);
      } else {
        // Return bad request if no filter is provided to prevent returning all registrations
        return res.status(400).json({ message: "Either eventId or userId query parameter is required" });
      }
      
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/registrations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const registration = await storage.getRegistration(id);
      
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json(registration);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/registrations", async (req: Request, res: Response) => {
    try {
      const registrationData = validateRequest(insertRegistrationSchema, req.body);
      
      // Check if user is already registered for this event
      const existingRegistration = await storage.getRegistrationByEventAndUser(
        registrationData.eventId, 
        registrationData.userId
      );
      
      if (existingRegistration) {
        return res.status(400).json({ message: "User is already registered for this event" });
      }
      
      // Check if event exists and is open for registration
      const event = await storage.getEvent(registrationData.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      if (!event.registrationOpen) {
        return res.status(400).json({ message: "Registration for this event is closed" });
      }
      
      // Check if event capacity is reached
      const eventRegistrations = await storage.getRegistrationsByEvent(registrationData.eventId);
      if (event.capacity && eventRegistrations.length >= event.capacity) {
        return res.status(400).json({ message: "Event has reached maximum capacity" });
      }
      
      const registration = await storage.createRegistration(registrationData);
      res.status(201).json(registration);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/registrations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const registration = await storage.getRegistration(id);
      
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      const updatedRegistration = await storage.updateRegistration(id, req.body);
      
      if (!updatedRegistration) {
        return res.status(500).json({ message: "Failed to update registration" });
      }
      
      res.json(updatedRegistration);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/registrations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const registration = await storage.getRegistration(id);
      
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      const deleted = await storage.deleteRegistration(id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete registration" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Community routes
  app.get("/api/communities", async (req: Request, res: Response) => {
    try {
      const managerId = req.query.managerId ? parseInt(req.query.managerId as string) : undefined;
      
      let communities;
      if (managerId) {
        communities = await storage.getCommunityByManager(managerId);
      } else {
        communities = await storage.getAllCommunities();
      }
      
      res.json(communities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/communities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const community = await storage.getCommunity(id);
      
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      
      res.json(community);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/communities", async (req: Request, res: Response) => {
    try {
      const communityData = validateRequest(insertCommunitySchema, req.body);
      const community = await storage.createCommunity(communityData);
      res.status(201).json(community);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/communities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const community = await storage.getCommunity(id);
      
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      
      const updatedCommunity = await storage.updateCommunity(id, req.body);
      
      if (!updatedCommunity) {
        return res.status(500).json({ message: "Failed to update community" });
      }
      
      res.json(updatedCommunity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/communities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const community = await storage.getCommunity(id);
      
      if (!community) {
        return res.status(404).json({ message: "Community not found" });
      }
      
      const deleted = await storage.deleteCommunity(id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete community" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Community Members routes
  app.get("/api/community-members", async (req: Request, res: Response) => {
    try {
      const communityId = req.query.communityId ? parseInt(req.query.communityId as string) : undefined;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let members;
      if (communityId) {
        members = await storage.getCommunityMembersByCommunity(communityId);
      } else if (userId) {
        members = await storage.getCommunityMembersByUser(userId);
      } else {
        return res.status(400).json({ message: "Either communityId or userId query parameter is required" });
      }
      
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/community-members", async (req: Request, res: Response) => {
    try {
      const memberData = validateRequest(insertCommunityMemberSchema, req.body);
      const member = await storage.createCommunityMember(memberData);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/community-members/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getCommunityMember(id);
      
      if (!member) {
        return res.status(404).json({ message: "Community member not found" });
      }
      
      const deleted = await storage.deleteCommunityMember(id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete community member" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Race Pack routes
  app.get("/api/race-packs", async (req: Request, res: Response) => {
    try {
      const eventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      
      if (!eventId) {
        return res.status(400).json({ message: "eventId query parameter is required" });
      }
      
      const racePacks = await storage.getRacePacksByEvent(eventId);
      res.json(racePacks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/race-packs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const racePack = await storage.getRacePack(id);
      
      if (!racePack) {
        return res.status(404).json({ message: "Race pack not found" });
      }
      
      res.json(racePack);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/race-packs", async (req: Request, res: Response) => {
    try {
      const racePackData = validateRequest(insertRacePackSchema, req.body);
      const racePack = await storage.createRacePack(racePackData);
      res.status(201).json(racePack);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/race-packs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const racePack = await storage.getRacePack(id);
      
      if (!racePack) {
        return res.status(404).json({ message: "Race pack not found" });
      }
      
      const updatedRacePack = await storage.updateRacePack(id, req.body);
      
      if (!updatedRacePack) {
        return res.status(500).json({ message: "Failed to update race pack" });
      }
      
      res.json(updatedRacePack);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/race-packs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const racePack = await storage.getRacePack(id);
      
      if (!racePack) {
        return res.status(404).json({ message: "Race pack not found" });
      }
      
      const deleted = await storage.deleteRacePack(id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete race pack" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Participant Checkpoint routes
  app.get("/api/participant-checkpoints", async (req: Request, res: Response) => {
    try {
      const registrationId = req.query.registrationId ? parseInt(req.query.registrationId as string) : undefined;
      
      if (!registrationId) {
        return res.status(400).json({ message: "registrationId query parameter is required" });
      }
      
      const checkpoints = await storage.getParticipantCheckpointsByRegistration(registrationId);
      res.json(checkpoints);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/participant-checkpoints", async (req: Request, res: Response) => {
    try {
      const checkpointData = validateRequest(insertParticipantCheckpointSchema, req.body);
      const checkpoint = await storage.createParticipantCheckpoint(checkpointData);
      res.status(201).json(checkpoint);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/participant-checkpoints/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const checkpoint = await storage.getParticipantCheckpoint(id);
      
      if (!checkpoint) {
        return res.status(404).json({ message: "Checkpoint not found" });
      }
      
      const updatedCheckpoint = await storage.updateParticipantCheckpoint(id, req.body);
      
      if (!updatedCheckpoint) {
        return res.status(500).json({ message: "Failed to update checkpoint" });
      }
      
      res.json(updatedCheckpoint);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Statistics and dashboard data
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      // Get all the data needed for the dashboard
      const allEvents = await storage.getAllEvents();
      const publishedEvents = allEvents.filter(event => event.status === "published");
      
      // Count registrations
      let totalRegistrations = 0;
      for (const event of publishedEvents) {
        const eventRegistrations = await storage.getRegistrationsByEvent(event.id);
        totalRegistrations += eventRegistrations.length;
      }
      
      const communities = await storage.getAllCommunities();
      
      // Calculate revenue
      let totalRevenue = 0;
      for (const event of publishedEvents) {
        const eventRegistrations = await storage.getRegistrationsByEvent(event.id);
        totalRevenue += eventRegistrations.length * (event.price || 0);
      }
      
      res.json({
        activeEvents: publishedEvents.length,
        totalRegistrations,
        communities: communities.length,
        revenue: totalRevenue
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
