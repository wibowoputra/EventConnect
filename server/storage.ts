import {
  users, type User, type InsertUser,
  events, type Event, type InsertEvent,
  registrations, type Registration, type InsertRegistration,
  communities, type Community, type InsertCommunity,
  communityMembers, type CommunityMember, type InsertCommunityMember,
  racePacks, type RacePack, type InsertRacePack,
  participantCheckpoints, type ParticipantCheckpoint, type InsertParticipantCheckpoint
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Event methods
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getEventsByOrganizer(organizerId: number): Promise<Event[]>;
  getEventsByStatus(status: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;

  // Registration methods
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrationsByEvent(eventId: number): Promise<Registration[]>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  getRegistrationByEventAndUser(eventId: number, userId: number): Promise<Registration | undefined>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: number, registrationData: Partial<Registration>): Promise<Registration | undefined>;
  deleteRegistration(id: number): Promise<boolean>;

  // Community methods
  getCommunity(id: number): Promise<Community | undefined>;
  getAllCommunities(): Promise<Community[]>;
  getCommunityByManager(managerId: number): Promise<Community[]>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  updateCommunity(id: number, communityData: Partial<Community>): Promise<Community | undefined>;
  deleteCommunity(id: number): Promise<boolean>;

  // Community member methods
  getCommunityMember(id: number): Promise<CommunityMember | undefined>;
  getCommunityMembersByCommunity(communityId: number): Promise<CommunityMember[]>;
  getCommunityMembersByUser(userId: number): Promise<CommunityMember[]>;
  createCommunityMember(communityMember: InsertCommunityMember): Promise<CommunityMember>;
  deleteCommunityMember(id: number): Promise<boolean>;

  // Race pack methods
  getRacePack(id: number): Promise<RacePack | undefined>;
  getRacePacksByEvent(eventId: number): Promise<RacePack[]>;
  createRacePack(racePack: InsertRacePack): Promise<RacePack>;
  updateRacePack(id: number, racePackData: Partial<RacePack>): Promise<RacePack | undefined>;
  deleteRacePack(id: number): Promise<boolean>;

  // Participant checkpoint methods
  getParticipantCheckpoint(id: number): Promise<ParticipantCheckpoint | undefined>;
  getParticipantCheckpointsByRegistration(registrationId: number): Promise<ParticipantCheckpoint[]>;
  createParticipantCheckpoint(checkpoint: InsertParticipantCheckpoint): Promise<ParticipantCheckpoint>;
  updateParticipantCheckpoint(id: number, checkpointData: Partial<ParticipantCheckpoint>): Promise<ParticipantCheckpoint | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private registrations: Map<number, Registration>;
  private communities: Map<number, Community>;
  private communityMembers: Map<number, CommunityMember>;
  private racePacks: Map<number, RacePack>;
  private participantCheckpoints: Map<number, ParticipantCheckpoint>;
  
  private userCurrentId: number;
  private eventCurrentId: number;
  private registrationCurrentId: number;
  private communityCurrentId: number;
  private communityMemberCurrentId: number;
  private racePackCurrentId: number;
  private participantCheckpointCurrentId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.registrations = new Map();
    this.communities = new Map();
    this.communityMembers = new Map();
    this.racePacks = new Map();
    this.participantCheckpoints = new Map();
    
    this.userCurrentId = 1;
    this.eventCurrentId = 1;
    this.registrationCurrentId = 1;
    this.communityCurrentId = 1;
    this.communityMemberCurrentId = 1;
    this.racePackCurrentId = 1;
    this.participantCheckpointCurrentId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create sample admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@eventhub.com",
      fullName: "Admin User",
      role: "admin",
    });

    // Create sample organizer
    this.createUser({
      username: "organizer",
      password: "organizer123",
      email: "organizer@eventhub.com",
      fullName: "Event Organizer",
      role: "organizer",
    });

    // Create sample participant
    this.createUser({
      username: "participant",
      password: "participant123",
      email: "participant@example.com",
      fullName: "John Participant",
      role: "participant",
    });

    // Create sample events
    const jakartaMarathon = this.createEvent({
      title: "Jakarta Marathon 2023",
      description: "Join the biggest marathon event in Jakarta",
      date: new Date("2023-10-15T07:00:00"),
      location: "Jakarta, Indonesia",
      category: "Running",
      capacity: 1000,
      price: 75,
      image: "https://images.unsplash.com/photo-1594882645126-14020914d58d",
      organizerId: 2,
      status: "published",
      registrationOpen: true,
    });

    const baliCycling = this.createEvent({
      title: "Bali Cycling Tour",
      description: "Experience the beauty of Bali while cycling",
      date: new Date("2023-11-05T06:30:00"),
      location: "Bali, Indonesia",
      category: "Cycling",
      capacity: 500,
      price: 85,
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
      organizerId: 2,
      status: "published",
      registrationOpen: true,
    });

    const lombokSwim = this.createEvent({
      title: "Lombok Open Water Swim",
      description: "Swim in the crystal clear waters of Lombok",
      date: new Date("2023-12-03T08:00:00"),
      location: "Lombok, Indonesia",
      category: "Swimming",
      capacity: 300,
      price: 65,
      image: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64",
      organizerId: 2,
      status: "published",
      registrationOpen: true,
    });

    // Create sample registrations
    for (let i = 0; i < 782; i++) {
      const userId = i % 2 === 0 ? 3 : this.userCurrentId++;
      const category = i % 3 === 0 ? "Marathon 42K" : "Half Marathon 21K";
      const status = i < 10 ? (i < 5 ? "active" : "finished") : "registered";
      
      if (i >= 3) {
        this.createUser({
          username: `participant${i}`,
          password: "password",
          email: `participant${i}@example.com`,
          fullName: `Participant ${i}`,
          role: "participant",
        });
      }

      this.createRegistration({
        eventId: jakartaMarathon.id,
        userId,
        status: status,
        bibNumber: i < 10 ? `M-${1000 + i}` : `M-${5000 + i}`,
        category,
        additionalInfo: { shirtSize: "M", emergencyContact: "123456789" },
      });
    }

    // Create sample registrations for Bali Cycling
    for (let i = 0; i < 215; i++) {
      const userId = this.userCurrentId - i;
      if (userId > 0) {
        this.createRegistration({
          eventId: baliCycling.id,
          userId,
          status: "registered",
          bibNumber: `C-${2000 + i}`,
          category: "Amateur",
          additionalInfo: { bikeType: "Mountain", emergencyContact: "123456789" },
        });
      }
    }

    // Create sample registrations for Lombok Swim
    for (let i = 0; i < 148; i++) {
      const userId = this.userCurrentId - (i * 2);
      if (userId > 0) {
        this.createRegistration({
          eventId: lombokSwim.id,
          userId,
          status: "registered",
          bibNumber: `S-${3000 + i}`,
          category: "Open Water 3K",
          additionalInfo: { swimExperience: "Intermediate", emergencyContact: "123456789" },
        });
      }
    }

    // Create sample communities
    const runningCommunity = this.createCommunity({
      name: "Jakarta Runners",
      description: "Community for running enthusiasts in Jakarta",
      managerId: 2,
    });

    const cyclingCommunity = this.createCommunity({
      name: "Bali Cyclists",
      description: "Community for cycling enthusiasts in Bali",
      managerId: 2,
    });

    const swimCommunity = this.createCommunity({
      name: "Indonesia Swimmers",
      description: "Community for swimming enthusiasts in Indonesia",
      managerId: 2,
    });

    const triathlonCommunity = this.createCommunity({
      name: "Triathlon Indonesia",
      description: "Community for triathlon enthusiasts in Indonesia",
      managerId: 2,
    });

    const fitnessCommunity = this.createCommunity({
      name: "Fitness Enthusiasts",
      description: "Community for fitness enthusiasts",
      managerId: 2,
    });

    // Create sample race packs
    this.createRacePack({
      eventId: jakartaMarathon.id,
      name: "Event T-Shirt",
      sku: "TS-MAR-2023",
      category: "Apparel",
      stockQuantity: 850,
      distributedQuantity: 682,
    });

    this.createRacePack({
      eventId: jakartaMarathon.id,
      name: "Finisher Medal",
      sku: "MD-MAR-2023",
      category: "Awards",
      stockQuantity: 800,
      distributedQuantity: 125,
    });

    this.createRacePack({
      eventId: jakartaMarathon.id,
      name: "Bib Numbers",
      sku: "BIB-MAR-2023",
      category: "Essentials",
      stockQuantity: 1000,
      distributedQuantity: 782,
    });

    this.createRacePack({
      eventId: jakartaMarathon.id,
      name: "Energy Drinks",
      sku: "DRK-MAR-2023",
      category: "Refreshments",
      stockQuantity: 200,
      distributedQuantity: 180,
    });

    // Create sample checkpoints
    for (let i = 1; i <= 10; i++) {
      const statuses = ["active", "finished", "active", "delayed"];
      const status = statuses[i % 4];
      const checkpointName = i <= 3 ? `Checkpoint ${i}` : (i === 4 ? "Finished" : `Checkpoint ${i}`);
      const distance = i * 7; // 7km intervals

      this.createParticipantCheckpoint({
        registrationId: i,
        checkpointName,
        checkpointDistance: distance,
        status,
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { ...userData, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEventsByOrganizer(organizerId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.organizerId === organizerId,
    );
  }

  async getEventsByStatus(status: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.status === status,
    );
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    const now = new Date();
    const event: Event = { ...eventData, id, createdAt: now };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Registration methods
  async getRegistration(id: number): Promise<Registration | undefined> {
    return this.registrations.get(id);
  }

  async getRegistrationsByEvent(eventId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.eventId === eventId,
    );
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.userId === userId,
    );
  }

  async getRegistrationByEventAndUser(eventId: number, userId: number): Promise<Registration | undefined> {
    return Array.from(this.registrations.values()).find(
      (registration) => registration.eventId === eventId && registration.userId === userId,
    );
  }

  async createRegistration(registrationData: InsertRegistration): Promise<Registration> {
    const id = this.registrationCurrentId++;
    const now = new Date();
    const registration: Registration = { ...registrationData, id, registrationDate: now };
    this.registrations.set(id, registration);
    return registration;
  }

  async updateRegistration(id: number, registrationData: Partial<Registration>): Promise<Registration | undefined> {
    const registration = await this.getRegistration(id);
    if (!registration) return undefined;
    
    const updatedRegistration = { ...registration, ...registrationData };
    this.registrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  async deleteRegistration(id: number): Promise<boolean> {
    return this.registrations.delete(id);
  }

  // Community methods
  async getCommunity(id: number): Promise<Community | undefined> {
    return this.communities.get(id);
  }

  async getAllCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values());
  }

  async getCommunityByManager(managerId: number): Promise<Community[]> {
    return Array.from(this.communities.values()).filter(
      (community) => community.managerId === managerId,
    );
  }

  async createCommunity(communityData: InsertCommunity): Promise<Community> {
    const id = this.communityCurrentId++;
    const now = new Date();
    const community: Community = { ...communityData, id, createdAt: now };
    this.communities.set(id, community);
    return community;
  }

  async updateCommunity(id: number, communityData: Partial<Community>): Promise<Community | undefined> {
    const community = await this.getCommunity(id);
    if (!community) return undefined;
    
    const updatedCommunity = { ...community, ...communityData };
    this.communities.set(id, updatedCommunity);
    return updatedCommunity;
  }

  async deleteCommunity(id: number): Promise<boolean> {
    return this.communities.delete(id);
  }

  // Community member methods
  async getCommunityMember(id: number): Promise<CommunityMember | undefined> {
    return this.communityMembers.get(id);
  }

  async getCommunityMembersByCommunity(communityId: number): Promise<CommunityMember[]> {
    return Array.from(this.communityMembers.values()).filter(
      (member) => member.communityId === communityId,
    );
  }

  async getCommunityMembersByUser(userId: number): Promise<CommunityMember[]> {
    return Array.from(this.communityMembers.values()).filter(
      (member) => member.userId === userId,
    );
  }

  async createCommunityMember(memberData: InsertCommunityMember): Promise<CommunityMember> {
    const id = this.communityMemberCurrentId++;
    const now = new Date();
    const member: CommunityMember = { ...memberData, id, joinDate: now };
    this.communityMembers.set(id, member);
    return member;
  }

  async deleteCommunityMember(id: number): Promise<boolean> {
    return this.communityMembers.delete(id);
  }

  // Race pack methods
  async getRacePack(id: number): Promise<RacePack | undefined> {
    return this.racePacks.get(id);
  }

  async getRacePacksByEvent(eventId: number): Promise<RacePack[]> {
    return Array.from(this.racePacks.values()).filter(
      (racePack) => racePack.eventId === eventId,
    );
  }

  async createRacePack(racePackData: InsertRacePack): Promise<RacePack> {
    const id = this.racePackCurrentId++;
    const racePack: RacePack = { ...racePackData, id };
    this.racePacks.set(id, racePack);
    return racePack;
  }

  async updateRacePack(id: number, racePackData: Partial<RacePack>): Promise<RacePack | undefined> {
    const racePack = await this.getRacePack(id);
    if (!racePack) return undefined;
    
    const updatedRacePack = { ...racePack, ...racePackData };
    this.racePacks.set(id, updatedRacePack);
    return updatedRacePack;
  }

  async deleteRacePack(id: number): Promise<boolean> {
    return this.racePacks.delete(id);
  }

  // Participant checkpoint methods
  async getParticipantCheckpoint(id: number): Promise<ParticipantCheckpoint | undefined> {
    return this.participantCheckpoints.get(id);
  }

  async getParticipantCheckpointsByRegistration(registrationId: number): Promise<ParticipantCheckpoint[]> {
    return Array.from(this.participantCheckpoints.values()).filter(
      (checkpoint) => checkpoint.registrationId === registrationId,
    );
  }

  async createParticipantCheckpoint(checkpointData: InsertParticipantCheckpoint): Promise<ParticipantCheckpoint> {
    const id = this.participantCheckpointCurrentId++;
    const now = new Date();
    const checkpoint: ParticipantCheckpoint = { ...checkpointData, id, timestamp: now };
    this.participantCheckpoints.set(id, checkpoint);
    return checkpoint;
  }

  async updateParticipantCheckpoint(id: number, checkpointData: Partial<ParticipantCheckpoint>): Promise<ParticipantCheckpoint | undefined> {
    const checkpoint = await this.getParticipantCheckpoint(id);
    if (!checkpoint) return undefined;
    
    const updatedCheckpoint = { ...checkpoint, ...checkpointData };
    this.participantCheckpoints.set(id, updatedCheckpoint);
    return updatedCheckpoint;
  }
}

export const storage = new MemStorage();
