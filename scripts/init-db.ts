import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { 
  users, indicators, associates, missions,
  indicatorTypeEnum, indicatorStatusEnum, professionEnum
} from "../shared/schema";
import { MemStorage } from '../server/storage';

// Fonction pour initialiser la base de données
async function initDb() {
  // Vérifier que la variable d'environnement DATABASE_URL est définie
  if (!process.env.DATABASE_URL) {
    console.warn('La variable d\'environnement DATABASE_URL n\'est pas définie, utilisation d\'une URL par défaut');
    process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/aci_online";
  }

  try {
    // Connexion à la base de données
    console.log('Connexion à la base de données...');
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Vérifier si les tables existent déjà
    console.log('Vérification des tables...');
    try {
      const indicatorsCount = await db.select({ count: { expression: 'COUNT(*)' } }).from(indicators);
      console.log(`Tables existantes, ${indicatorsCount[0].count} indicateurs trouvés.`);
      
      // Si des données existent déjà, ne rien faire
      if (indicatorsCount[0].count > 0) {
        console.log('La base de données est déjà initialisée.');
        return;
      }
    } catch (error) {
      console.log('Les tables n\'existent pas encore, création des tables...');
      
      // Exécuter les migrations pour créer les tables
      console.log('Exécution des migrations...');
      await migrate(db, { migrationsFolder: './migrations' });
      console.log('Migrations exécutées avec succès');
    }

    // Initialiser les données de base
    console.log('Initialisation des données...');
    
    // Utiliser MemStorage pour obtenir les données initiales
    const memStorage = new MemStorage();
    
    // Récupérer les indicateurs, associés et missions
    const allIndicators = await memStorage.getIndicators();
    const allAssociates = await memStorage.getAssociates();
    const allMissions = await memStorage.getMissions();
    
    // Insérer les indicateurs
    console.log(`Insertion de ${allIndicators.length} indicateurs...`);
    for (const indicator of allIndicators) {
      const { id, ...indicatorData } = indicator;
      await db.insert(indicators).values(indicatorData);
    }
    
    // Insérer les associés
    console.log(`Insertion de ${allAssociates.length} associés...`);
    for (const associate of allAssociates) {
      const { id, ...associateData } = associate;
      await db.insert(associates).values(associateData);
    }
    
    // Insérer les missions
    console.log(`Insertion de ${allMissions.length} missions...`);
    for (const mission of allMissions) {
      const { id, ...missionData } = mission;
      await db.insert(missions).values(missionData);
    }
    
    console.log('Données initiales insérées avec succès');
    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
}

// Exécuter la fonction
initDb();
