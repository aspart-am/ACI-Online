import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { 
  users, indicators, associates, missions,
  indicatorTypeEnum, indicatorStatusEnum, professionEnum
} from "../shared/schema";
import { MemStorage } from '../server/storage';

// Fonction pour générer les migrations
async function generateMigrations() {
  // Vérifier que la variable d'environnement DATABASE_URL est définie
  if (!process.env.DATABASE_URL) {
    console.error('La variable d\'environnement DATABASE_URL n\'est pas définie');
    process.exit(1);
  }

  try {
    // Connexion à la base de données
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Exécuter les migrations
    console.log('Exécution des migrations...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations exécutées avec succès');

    // Initialiser les données de base si nécessaire
    console.log('Vérification des données initiales...');
    const indicatorsCount = await db.select({ count: { expression: 'COUNT(*)' } }).from(indicators);
    
    if (indicatorsCount[0].count === 0) {
      console.log('Aucun indicateur trouvé, initialisation des données...');
      
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
    } else {
      console.log('Des données existent déjà dans la base de données');
    }
    
    console.log('Processus terminé avec succès');
  } catch (error) {
    console.error('Erreur lors de la génération des migrations:', error);
    process.exit(1);
  }
}

// Exécuter la fonction
generateMigrations();
