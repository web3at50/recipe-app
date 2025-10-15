// User feedback types
export interface UserFeedback {
  id?: string;
  user_id: string;
  page: string;
  liked?: string;
  disliked?: string;
  device_type?: string;
  suggestions?: string;
  overall_rating?: number;
  ease_of_use?: number;
  created_at?: string;
  user_agent?: string;
  viewport_width?: number;
  viewport_height?: number;
}

export interface FeedbackFormData {
  liked?: string;
  disliked?: string;
  suggestions?: string;
}
