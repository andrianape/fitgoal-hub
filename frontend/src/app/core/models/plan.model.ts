import { Professional } from './professional.model';
import { User } from './user.model';

export interface NutritionPlanMeal {
  name: string;
  time: string;
  description: string;
}

export interface NutritionPlanDay {
  day: string;
  meals: NutritionPlanMeal[];
}

export interface NutritionPlanContent {
  generalInstructions: string;
  dailyWaterIntake: string;
  days: NutritionPlanDay[];
}

export interface Plan {
  id: number;
  client: User;
  professional: Professional;
  type: 'nutrition';
  title: string;
  description: string | null;
  content: NutritionPlanContent;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanRequest {
  clientId: number;
  title: string;
  description?: string;
  content: NutritionPlanContent;
  startDate: string;
  endDate?: string;
}

export interface UpdatePlanRequest {
  title?: string;
  description?: string;
  content?: NutritionPlanContent;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}