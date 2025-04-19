import { 
  users, type User, type InsertUser,
  indicators, type Indicator, type InsertIndicator,
  associates, type Associate, type InsertAssociate,
  missions, type Mission, type InsertMission,
  indicatorStatusEnum
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Indicator methods
  getIndicators(): Promise<Indicator[]>;
  getIndicator(id: number): Promise<Indicator | undefined>;
  getIndicatorByCode(code: string): Promise<Indicator | undefined>;
  createIndicator(indicator: InsertIndicator): Promise<Indicator>;
  updateIndicator(id: number, indicator: Partial<InsertIndicator>): Promise<Indicator | undefined>;

  // Associate methods
  getAssociates(): Promise<Associate[]>;
  getAssociate(id: number): Promise<Associate | undefined>;
  createAssociate(associate: InsertAssociate): Promise<Associate>;
  updateAssociate(id: number, associate: Partial<InsertAssociate>): Promise<Associate | undefined>;
  deleteAssociate(id: number): Promise<boolean>;

  // Mission methods
  getMissions(): Promise<Mission[]>;
  getMissionsByAssociate(associateId: number): Promise<Mission[]>;
  getMissionsByIndicator(indicatorId: number): Promise<Mission[]>;
  getMission(id: number): Promise<Mission | undefined>;
  createMission(mission: InsertMission): Promise<Mission>;
  updateMission(id: number, mission: Partial<InsertMission>): Promise<Mission | undefined>;
  deleteMission(id: number): Promise<boolean>;

  // Stats methods
  getStats(): Promise<{
    totalCoreIndicators: number;
    validatedCoreIndicators: number;
    totalOptionalIndicators: number;
    validatedOptionalIndicators: number;
    fixedCompensation: number;
    maxFixedCompensation: number;
    variableCompensation: number;
    maxVariableCompensation: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private indicatorsMap: Map<number, Indicator>;
  private associatesMap: Map<number, Associate>;
  private missionsMap: Map<number, Mission>;
  
  private currentUserId: number;
  private currentIndicatorId: number;
  private currentAssociateId: number;
  private currentMissionId: number;

  constructor() {
    this.users = new Map();
    this.indicatorsMap = new Map();
    this.associatesMap = new Map();
    this.missionsMap = new Map();
    
    this.currentUserId = 1;
    this.currentIndicatorId = 1;
    this.currentAssociateId = 1;
    this.currentMissionId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // AXE 1: Accès aux soins - Indicateurs Socles et Prérequis
    const axe1SocleIndicators: InsertIndicator[] = [
      {
        code: "AS01",
        name: "Horaires d'ouverture et soins non programmés",
        description: "Amplitude horaire d'ouverture et accès à des soins non programmés chaque jour ouvré",
        type: "core",
        objective: "100%",
        maxCompensation: 4000 // 800 points × 5€
      },
      {
        code: "AS02",
        name: "Réponse aux crises sanitaires graves",
        description: "Rédaction d'un plan de préparation à la réponse de crise sanitaire et mise en œuvre d'actions",
        type: "core",
        objective: "Rédaction du plan (prérequis) + actions en cas de crise",
        maxCompensation: 2250 // (100 points + 350 points) × 5€
      }
    ];

    // AXE 1: Accès aux soins - Indicateurs Optionnels
    const axe1OptIndicators: InsertIndicator[] = [
      {
        code: "AO01",
        name: "Diversité des services de soins",
        description: "Offre d'une diversité de services de soins médicaux spécialisés ou de pharmaciens et/ou de soins paramédicaux",
        type: "optional",
        objective: "Diversité des catégories de professionnels",
        maxCompensation: 2250 // 450 points × 5€
      },
      {
        code: "AO02",
        name: "Consultations de spécialistes",
        description: "Consultations de spécialistes de second recours ou sages-femmes ou chirurgiens-dentistes ou pharmaciens vacataires",
        type: "optional",
        objective: "Organisation effective",
        maxCompensation: 1000 // 200 points × 5€
      },
      {
        code: "AO03",
        name: "Accueil de médecins en CSTM",
        description: "Accueil de médecins intervenant dans la structure dans le cadre d'un Contrat de Solidarité Territoriale Médecin",
        type: "optional",
        objective: "Présence effective d'un médecin en CSTM",
        maxCompensation: 1000 // 200 points × 5€
      },
      {
        code: "AO04",
        name: "Missions de santé publique",
        description: "Participation à des missions de santé publique (vaccination, dépistage, prévention, etc.)",
        type: "optional",
        objective: "Min. 4 missions",
        maxCompensation: 1750 // 350 points × 5€
      },
      {
        code: "AO05",
        name: "Implication des usagers",
        description: "Mise en place d'une démarche d'implication des usagers",
        type: "optional",
        objective: "Démarche effective",
        maxCompensation: 1000 // 200 points × 5€
      },
      {
        code: "AO06",
        name: "SAS - Service d'Accès aux Soins",
        description: "Soins non programmés en lien avec le dispositif de Service d'Accès aux Soins",
        type: "optional",
        objective: "Participation effective au SAS",
        maxCompensation: 1250 // 250 points × 5€
      }
    ];

    // AXE 2: Travail en équipe et coordination - Indicateurs Socles et Prérequis
    const axe2SoclePrerequisIndicators: InsertIndicator[] = [
      {
        code: "CS01",
        name: "Fonction de coordination",
        description: "Mise en place d'une fonction de coordination bien identifiée et temps dédié",
        type: "core",
        objective: "Temps dédié à la coordination et outils disponibles",
        maxCompensation: 7000 // 1400 points × 5€
      }
    ];

    // AXE 2: Travail en équipe et coordination - Indicateurs Socles
    const axe2SocleIndicators: InsertIndicator[] = [
      {
        code: "CS02",
        name: "Protocoles pluriprofessionnels",
        description: "Élaboration et mise en œuvre de protocoles pluriprofessionnels pour la prise en charge de patients à risque de fragilité",
        type: "core",
        objective: "Min. 8 protocoles",
        maxCompensation: 5000 // 1000 points × 5€
      },
      {
        code: "CS03",
        name: "Concertation pluriprofessionnelle",
        description: "Organisation de réunions de concertation pluriprofessionnelles sur les dossiers patients",
        type: "core",
        objective: "Min. 12 réunions/an",
        maxCompensation: 5000 // 1000 points × 5€
      }
    ];

    // AXE 2: Travail en équipe et coordination - Indicateurs Optionnels
    const axe2OptIndicators: InsertIndicator[] = [
      {
        code: "CO01",
        name: "Formation professionnels de santé",
        description: "Accueil et formation de professionnels de santé (stagiaires médicaux et paramédicaux)",
        type: "optional",
        objective: "Accueil effectif de stagiaires",
        maxCompensation: 2500 // 500 points × 5€
      },
      {
        code: "CO02",
        name: "Coordination externe",
        description: "Coordination avec acteurs médico-sociaux et sociaux (EHPAD, SSIAD, etc.)",
        type: "optional",
        objective: "Min. 4 partenariats formalisés",
        maxCompensation: 2000 // 400 points × 5€
      },
      {
        code: "CO03",
        name: "Démarche qualité",
        description: "Mise en place d'une démarche d'évaluation et d'amélioration des pratiques",
        type: "optional",
        objective: "Démarche effective et formalisée",
        maxCompensation: 2000 // 400 points × 5€
      },
      {
        code: "CO04",
        name: "Protocoles soins non programmés",
        description: "Mise en place de protocoles nationaux de coopération pour les soins non programmés",
        type: "optional",
        objective: "Application effective des protocoles",
        maxCompensation: 1750 // 350 points × 5€
      },
      {
        code: "CO05",
        name: "Parcours insuffisance cardiaque",
        description: "Coordination d'un parcours insuffisance cardiaque avec télésurveillance",
        type: "optional",
        objective: "Min. 5 patients suivis",
        maxCompensation: 2250 // 450 points × 5€
      },
      {
        code: "CO06",
        name: "Parcours obésité enfant",
        description: "Coordination d'un parcours 'surpoids ou obésité de l'enfant'",
        type: "optional",
        objective: "Parcours formalisé et effectif",
        maxCompensation: 2000 // 400 points × 5€
      }
    ];

    // AXE 3: Système d'information - Indicateur Socle et Prérequis
    const axe3SocleIndicators: InsertIndicator[] = [
      {
        code: "SI01",
        name: "Système d'information niveau standard",
        description: "Système d'information conforme au référentiel établi par l'ANS (niveau standard)",
        type: "core",
        objective: "Utilisation par tous les professionnels",
        maxCompensation: 4000 // 800 points × 5€
      }
    ];

    // AXE 3: Système d'information - Indicateur Optionnel
    const axe3OptIndicators: InsertIndicator[] = [
      {
        code: "SIO1",
        name: "Système d'information niveau avancé",
        description: "Système d'information conforme au référentiel établi par l'ANS (niveau avancé)",
        type: "optional",
        objective: "Déploiement et utilisation effective",
        maxCompensation: 2000 // 400 points × 5€
      }
    ];
    
    // Initialize all indicators for calculation and display
    const allCoreIndicators: InsertIndicator[] = [
      ...axe1SocleIndicators,
      ...axe2SoclePrerequisIndicators, 
      ...axe2SocleIndicators,
      ...axe3SocleIndicators
    ];
    
    const allOptionalIndicators: InsertIndicator[] = [
      ...axe1OptIndicators,
      ...axe2OptIndicators,
      ...axe3OptIndicators
    ];

    // Add all indicators
    for (const indicator of allCoreIndicators) {
      this.createIndicator(indicator);
    }
    
    for (const indicator of allOptionalIndicators) {
      this.createIndicator(indicator);
    }

    // Create associates
    const associates: InsertAssociate[] = [
      {
        firstName: "Martin",
        lastName: "Dubois",
        profession: "doctor",
        email: "martin.dubois@example.com",
        phone: "0123456789"
      },
      {
        firstName: "Sophie",
        lastName: "Lefevre",
        profession: "doctor",
        email: "sophie.lefevre@example.com",
        phone: "0234567890"
      },
      {
        firstName: "Philippe",
        lastName: "Moreau",
        profession: "pharmacist",
        email: "philippe.moreau@example.com",
        phone: "0345678901"
      }
    ];

    // Add associates
    const createdAssociates = associates.map(associate => this.createAssociate(associate));

    // Create missions
    // Pour Martin Dubois (missions validées)
    this.createMission({
      associateId: 1,
      indicatorId: 1, // AS01 - Horaires d'ouverture et soins non programmés
      status: "validated",
      currentValue: "41h/semaine",
      compensation: 4000,
      notes: "Amplitude horaire respectée et soins non programmés disponibles"
    });

    this.createMission({
      associateId: 1,
      indicatorId: 6, // CS01 - Fonction de coordination
      status: "validated",
      currentValue: "10h par semaine",
      compensation: 7000,
      notes: "Temps dédié à la coordination bien défini et occupé par l'associé"
    });

    this.createMission({
      associateId: 1,
      indicatorId: 10, // CO01 - Formation de professionnels de santé
      status: "in_progress",
      currentValue: "1 stagiaire",
      compensation: 0,
      notes: "Un stagiaire en médecine générale accueilli, en attente d'un second"
    });

    // Pour Sophie Lefevre
    this.createMission({
      associateId: 2,
      indicatorId: 2, // AS02 - Réponse aux crises sanitaires graves
      status: "validated",
      currentValue: "Plan rédigé et mis en œuvre",
      compensation: 2250,
      notes: "Plan de crise rédigé et une intervention lors d'un pic épidémique"
    });

    this.createMission({
      associateId: 2,
      indicatorId: 7, // CS02 - Protocoles pluriprofessionnels
      status: "validated",
      currentValue: "9 protocoles",
      compensation: 5000,
      notes: "Protocoles bien documentés et mis en œuvre"
    });

    this.createMission({
      associateId: 2,
      indicatorId: 11, // CO02 - Coordination externe
      status: "not_validated",
      currentValue: "2 partenariats",
      compensation: 0,
      notes: "Partenariats avec EHPAD et SSIAD, mais nombre insuffisant"
    });

    // Pour Philippe Moreau
    this.createMission({
      associateId: 3,
      indicatorId: 8, // CS03 - Concertation pluriprofessionnelle
      status: "validated",
      currentValue: "15 réunions",
      compensation: 5000,
      notes: "Réunions régulières documentées avec compte-rendus"
    });

    this.createMission({
      associateId: 3,
      indicatorId: 3, // AO01 - Diversité des services de soins
      status: "in_progress",
      currentValue: "4 catégories",
      compensation: 0,
      notes: "Médecins, pharmaciens, infirmiers et kinés disponibles"
    });

    this.createMission({
      associateId: 3,
      indicatorId: 9, // SI01 - Système d'information niveau standard
      status: "validated",
      currentValue: "Déployé et utilisé par tous",
      compensation: 4000,
      notes: "Logiciel conforme au référentiel ANS et utilisé par 100% des professionnels"
    });
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Indicator methods
  async getIndicators(): Promise<Indicator[]> {
    return Array.from(this.indicatorsMap.values());
  }

  async getIndicator(id: number): Promise<Indicator | undefined> {
    return this.indicatorsMap.get(id);
  }

  async getIndicatorByCode(code: string): Promise<Indicator | undefined> {
    return Array.from(this.indicatorsMap.values()).find(
      (indicator) => indicator.code === code
    );
  }

  async createIndicator(insertIndicator: InsertIndicator): Promise<Indicator> {
    const id = this.currentIndicatorId++;
    const indicator: Indicator = { ...insertIndicator, id };
    this.indicatorsMap.set(id, indicator);
    return indicator;
  }

  async updateIndicator(id: number, indicator: Partial<InsertIndicator>): Promise<Indicator | undefined> {
    const existing = this.indicatorsMap.get(id);
    if (!existing) {
      return undefined;
    }
    const updated = { ...existing, ...indicator };
    this.indicatorsMap.set(id, updated);
    return updated;
  }

  // Associate methods
  async getAssociates(): Promise<Associate[]> {
    return Array.from(this.associatesMap.values());
  }

  async getAssociate(id: number): Promise<Associate | undefined> {
    return this.associatesMap.get(id);
  }

  async createAssociate(insertAssociate: InsertAssociate): Promise<Associate> {
    const id = this.currentAssociateId++;
    const associate: Associate = { ...insertAssociate, id };
    this.associatesMap.set(id, associate);
    return associate;
  }

  async updateAssociate(id: number, associate: Partial<InsertAssociate>): Promise<Associate | undefined> {
    const existing = this.associatesMap.get(id);
    if (!existing) {
      return undefined;
    }
    const updated = { ...existing, ...associate };
    this.associatesMap.set(id, updated);
    return updated;
  }

  async deleteAssociate(id: number): Promise<boolean> {
    return this.associatesMap.delete(id);
  }

  // Mission methods
  async getMissions(): Promise<Mission[]> {
    return Array.from(this.missionsMap.values());
  }

  async getMissionsByAssociate(associateId: number): Promise<Mission[]> {
    return Array.from(this.missionsMap.values()).filter(
      (mission) => mission.associateId === associateId
    );
  }

  async getMissionsByIndicator(indicatorId: number): Promise<Mission[]> {
    return Array.from(this.missionsMap.values()).filter(
      (mission) => mission.indicatorId === indicatorId
    );
  }

  async getMission(id: number): Promise<Mission | undefined> {
    return this.missionsMap.get(id);
  }

  async createMission(insertMission: InsertMission): Promise<Mission> {
    const id = this.currentMissionId++;
    const mission: Mission = { ...insertMission, id };
    this.missionsMap.set(id, mission);
    return mission;
  }

  async updateMission(id: number, mission: Partial<InsertMission>): Promise<Mission | undefined> {
    const existing = this.missionsMap.get(id);
    if (!existing) {
      return undefined;
    }
    const updated = { ...existing, ...mission };
    this.missionsMap.set(id, updated);
    return updated;
  }

  async deleteMission(id: number): Promise<boolean> {
    return this.missionsMap.delete(id);
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
    const indicators = await this.getIndicators();
    const missions = await this.getMissions();
    
    const coreIndicators = indicators.filter(i => i.type === 'core');
    const optionalIndicators = indicators.filter(i => i.type === 'optional');
    
    const coreIndicatorIds = new Set(coreIndicators.map(i => i.id));
    const optionalIndicatorIds = new Set(optionalIndicators.map(i => i.id));
    
    const coreMissions = missions.filter(m => coreIndicatorIds.has(m.indicatorId));
    const optionalMissions = missions.filter(m => optionalIndicatorIds.has(m.indicatorId));
    
    const validatedCoreMissions = coreMissions.filter(m => m.status === 'validated');
    const validatedOptionalMissions = optionalMissions.filter(m => m.status === 'validated');
    
    const fixedCompensation = validatedCoreMissions.reduce((sum, m) => sum + (m.compensation || 0), 0);
    const variableCompensation = validatedOptionalMissions.reduce((sum, m) => sum + (m.compensation || 0), 0);
    
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

import { PgStorage } from './pg-storage';

// Utiliser PgStorage en production et MemStorage en développement
// Par défaut, utiliser MemStorage si NODE_ENV n'est pas défini
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Mode: ${isProduction ? 'production' : 'développement'}, utilisation de ${isProduction ? 'PgStorage' : 'MemStorage'}`);

export const storage = isProduction 
  ? new PgStorage() 
  : new MemStorage();
