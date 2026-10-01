export interface ReviewClient {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Review {
  id: number;
  rating: number;
  client: ReviewClient;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalReviewsResponse {
  data: Review[];
  total: number;
  averageRating: number;
}

export interface CreateReviewRequest {
  appointmentId: number;
  rating: number;
}

export interface UpdateReviewRequest {
  rating?: number;
}