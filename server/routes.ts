import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertIndicatorSchema, 
  insertAssociateSchema, 
  insertMissionSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Get all indicators
  apiRouter.get("/indicators", async (req, res) => {
    const indicators = await storage.getIndicators();
    res.json(indicators);
  });

  // Get indicator by ID
  apiRouter.get("/indicators/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const indicator = await storage.getIndicator(id);
    if (!indicator) {
      return res.status(404).json({ message: "Indicator not found" });
    }
    
    res.json(indicator);
  });

  // Create indicator
  apiRouter.post("/indicators", async (req, res) => {
    try {
      const data = insertIndicatorSchema.parse(req.body);
      const indicator = await storage.createIndicator(data);
      res.status(201).json(indicator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid indicator data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create indicator" });
    }
  });

  // Update indicator
  apiRouter.patch("/indicators/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const validFields = insertIndicatorSchema.partial().parse(req.body);
      const updated = await storage.updateIndicator(id, validFields);
      
      if (!updated) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid indicator data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update indicator" });
    }
  });

  // Get all associates
  apiRouter.get("/associates", async (req, res) => {
    const associates = await storage.getAssociates();
    res.json(associates);
  });

  // Get associate by ID
  apiRouter.get("/associates/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const associate = await storage.getAssociate(id);
    if (!associate) {
      return res.status(404).json({ message: "Associate not found" });
    }
    
    res.json(associate);
  });

  // Create associate
  apiRouter.post("/associates", async (req, res) => {
    try {
      const data = insertAssociateSchema.parse(req.body);
      const associate = await storage.createAssociate(data);
      res.status(201).json(associate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid associate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create associate" });
    }
  });

  // Update associate
  apiRouter.patch("/associates/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const validFields = insertAssociateSchema.partial().parse(req.body);
      const updated = await storage.updateAssociate(id, validFields);
      
      if (!updated) {
        return res.status(404).json({ message: "Associate not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid associate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update associate" });
    }
  });

  // Delete associate
  apiRouter.delete("/associates/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const success = await storage.deleteAssociate(id);
    if (!success) {
      return res.status(404).json({ message: "Associate not found" });
    }
    
    res.status(204).send();
  });

  // Get all missions
  apiRouter.get("/missions", async (req, res) => {
    const missions = await storage.getMissions();
    res.json(missions);
  });

  // Get missions by associate ID
  apiRouter.get("/associates/:id/missions", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const missions = await storage.getMissionsByAssociate(id);
    res.json(missions);
  });

  // Get missions by indicator ID
  apiRouter.get("/indicators/:id/missions", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const missions = await storage.getMissionsByIndicator(id);
    res.json(missions);
  });

  // Get mission by ID
  apiRouter.get("/missions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const mission = await storage.getMission(id);
    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }
    
    res.json(mission);
  });

  // Create mission
  apiRouter.post("/missions", async (req, res) => {
    try {
      const data = insertMissionSchema.parse(req.body);
      const mission = await storage.createMission(data);
      res.status(201).json(mission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create mission" });
    }
  });

  // Update mission
  apiRouter.patch("/missions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const validFields = insertMissionSchema.partial().parse(req.body);
      const updated = await storage.updateMission(id, validFields);
      
      if (!updated) {
        return res.status(404).json({ message: "Mission not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid mission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update mission" });
    }
  });

  // Delete mission
  apiRouter.delete("/missions/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const success = await storage.deleteMission(id);
    if (!success) {
      return res.status(404).json({ message: "Mission not found" });
    }
    
    res.status(204).send();
  });

  // Get statistics
  apiRouter.get("/stats", async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Get full data for dashboard
  apiRouter.get("/dashboard", async (req, res) => {
    const [stats, indicators, associates, missions] = await Promise.all([
      storage.getStats(),
      storage.getIndicators(),
      storage.getAssociates(),
      storage.getMissions()
    ]);

    res.json({
      stats,
      indicators,
      associates,
      missions
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
