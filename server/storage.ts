import type { 
  Category, 
  TherapyScript, 
  Practice, 
  SessionCompletionStep 
} from "@shared/schema";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getScripts(): Promise<TherapyScript[]>;
  getScriptsByCategory(categoryId: string): Promise<TherapyScript[]>;
  getScriptById(id: string): Promise<TherapyScript | undefined>;
  getPractices(): Promise<Practice[]>;
  getSessionCompletionSteps(): Promise<SessionCompletionStep[]>;
}

import { 
  categories, 
  scripts, 
  practices, 
  sessionCompletionSteps 
} from "../client/src/data/therapyContent";

export class MemStorage implements IStorage {
  private categoriesData: Category[];
  private scriptsData: TherapyScript[];
  private practicesData: Practice[];
  private sessionCompletionStepsData: SessionCompletionStep[];

  constructor() {
    this.categoriesData = categories;
    this.scriptsData = scripts;
    this.practicesData = practices;
    this.sessionCompletionStepsData = sessionCompletionSteps;
  }

  async getCategories(): Promise<Category[]> {
    return this.categoriesData.sort((a, b) => a.order - b.order);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categoriesData.find(c => c.id === id);
  }

  async getScripts(): Promise<TherapyScript[]> {
    return this.scriptsData.sort((a, b) => a.order - b.order);
  }

  async getScriptsByCategory(categoryId: string): Promise<TherapyScript[]> {
    return this.scriptsData
      .filter(s => s.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  async getScriptById(id: string): Promise<TherapyScript | undefined> {
    return this.scriptsData.find(s => s.id === id);
  }

  async getPractices(): Promise<Practice[]> {
    return this.practicesData.sort((a, b) => a.order - b.order);
  }

  async getSessionCompletionSteps(): Promise<SessionCompletionStep[]> {
    return this.sessionCompletionStepsData.sort((a, b) => a.order - b.order);
  }
}

export const storage = new MemStorage();
