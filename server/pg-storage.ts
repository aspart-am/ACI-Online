import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { 
  users, type User, type InsertUser,
  indicators, type Indicator, type InsertIndicator,
  associates, type Associate, type InsertAssociate,
  missions, type Mission, type InsertMission,
  indicatorStatusEnum
} from "@shared/schema";
import { eq } from 'drizzle-orm';
import { IStorage } from './storage';

export class PgStorage implements IStorage {
  private db;

  constructor() {
    // Vérifier que la variable d'environnement DATABASE_URL est définie
    if (!process.env.DATABASE_URL) {
      console.warn('La variable d\'environnement DATABASE_URL n\'est pas définie, utilisation d\'une URL par défaut');
      process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/aci_online";
    }
    
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Indicator methods
  async getIndicators(): Promise<Indicator[]> {
    return await this.db.select().from(indicators);
  }

  async getIndicator(id: number): Promise<Indicator | undefined> {
    const result = await this.db.select().from(indicators).where(eq(indicators.id, id));
    return result[0];
  }

  async getIndicatorByCode(code: string): Promise<Indicator | undefined> {
    const result = await this.db.select().from(indicators).where(eq(indicators.code, code));
    return result[0];
  }

  async createIndicator(insertIndicator: InsertIndicator): Promise<Indicator> {
    const result = await this.db.insert(indicators).values(insertIndicator).returning();
    return result[0];
  }

  async updateIndicator(id: number, indicator: Partial<InsertIndicator>): Promise<Indicator | undefined> {
    const result = await this.db.update(indicators)
      .set(indicator)
      .where(eq(indicators.id, id))
      .returning();
    return result[0];
  }

  // Associate methods
  async getAssociates(): Promise<Associate[]> {
    return await this.db.select().from(associates);
  }

  async getAssociate(id: number): Promise<Associate | undefined> {
    const result = await this.db.select().from(associates).where(eq(associates.id, id));
    return result[0];
  }

  async createAssociate(insertAssociate: InsertAssociate): Promise<Associate> {
    const result = await this.db.insert(associates).values(insertAssociate).returning();
    return result[0];
  }

  async updateAssociate(id: number, associate: Partial<InsertAssociate>): Promise<Associate | undefined> {
    const result = await this.db.update(associates)
      .set(associate)
      .where(eq(associates.id, id))
      .returning();
    return result[0];
  }

  async deleteAssociate(id: number): Promise<boolean> {
    const result = await this.db.delete(associates).where(eq(associates.id, id)).returning();
    return result.length > 0;
  }

  // Mission methods
  async getMissions(): Promise<Mission[]> {
    return await this.db.select().from(missions);
  }

  async getMissionsByAssociate(associateId: number): Promise<Mission[]> {
    return await this.db.select().from(missions).where(eq(missions.associateId, associateId));
  }

  async getMissionsByIndicator(indicatorId: number): Promise<Mission[]> {
    return await this.db.select().from(missions).where(eq(missions.indicatorId, indicatorId));
  }

  async getMission(id: number): Promise<Mission | undefined> {
    const result = await this.db.select().from(missions).where(eq(missions.id, id));
    return result[0];
  }

  async createMission(insertMission: InsertMission): Promise<Mission> {
    const result = await this.db.insert(missions).values(insertMission).returning();
    return result[0];
  }

  async updateMission(id: number, mission: Partial<InsertMission>): Promise<Mission | undefined> {
    const result = await this.db.update(missions)
      .set(mission)
      .where(eq(missions.id, id))
      .returning();
    return result[0];
  }

  async deleteMission(id: number): Promise<boolean> {
    const result = await this.db.delete(missions).where(eq(missions.id, id)).returning();
    return result.length > 0;
  }

  // Stats methods
  async getStats(): Promise<{
    totalCoreIndicators: number;
    validatedCoreIndicators: number;
    totalOptionalIndicators: number;
    validatedOptionalIndicators: number;
    fixedCompensation: number;
    maxFixedCompensation: number;
    variableCompensation: number;
    maxVariableCompensation: number;
  }> {
    // Get all indicators
    const allIndicators = await this.getIndicators();
    
    // Get all missions
    const allMissions = await this.getMissions();
    
    // Filter core and optional indicators
    const coreIndicators = allIndicators.filter(i => i.type === 'core');
    const optionalIndicators = allIndicators.filter(i => i.type === 'optional');
    
    // Create sets of indicator IDs for faster lookup
    const coreIndicatorIds = new Set(coreIndicators.map(i => i.id));
    const optionalIndicatorIds = new Set(optionalIndicators.map(i => i.id));
    
    // Filter missions by indicator type
    const coreMissions = allMissions.filter(m => coreIndicatorIds.has(m.indicatorId));
    const optionalMissions = allMissions.filter(m => optionalIndicatorIds.has(m.indicatorId));
    
    // Filter validated missions
    const validatedCoreMissions = coreMissions.filter(m => m.status === 'validated');
    const validatedOptionalMissions = optionalMissions.filter(m => m.status === 'validated');
    
    // Calculate compensations
    const fixedCompensation = validatedCoreMissions.reduce((sum, m) => sum + (m.compensation || 0), 0);
    const variableCompensation = validatedOptionalMissions.reduce((sum, m) => sum + (m.compensation || 0), 0);
    
    // Calculate maximum possible compensations
    const maxFixedCompensation = coreIndicators.reduce((sum, i) => sum + i.maxCompensation, 0);
    const maxVariableCompensation = optionalIndicators.reduce((sum, i) => sum + i.maxCompensation, 0);
    
    return {
      totalCoreIndicators: coreIndicators.length,
      validatedCoreIndicators: validatedCoreMissions.length,
      totalOptionalIndicators: optionalIndicators.length,
      validatedOptionalIndicators: validatedOptionalMissions.length,
      fixedCompensation,
      maxFixedCompensation,
      variableCompensation,
      maxVariableCompensation
    };
  }
}
