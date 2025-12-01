import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  app.get("/api/scripts", async (req, res) => {
    try {
      const { categoryId } = req.query;
      let scripts;
      if (categoryId && typeof categoryId === "string") {
        scripts = await storage.getScriptsByCategory(categoryId);
      } else {
        scripts = await storage.getScripts();
      }
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  app.get("/api/scripts/:id", async (req, res) => {
    try {
      const script = await storage.getScriptById(req.params.id);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }
      res.json(script);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch script" });
    }
  });

  app.get("/api/practices", async (req, res) => {
    try {
      const practices = await storage.getPractices();
      res.json(practices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch practices" });
    }
  });

  app.get("/api/session-completion", async (req, res) => {
    try {
      const steps = await storage.getSessionCompletionSteps();
      res.json(steps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session completion steps" });
    }
  });

  return httpServer;
}
