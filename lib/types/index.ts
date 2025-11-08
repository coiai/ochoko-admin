export interface Sake {
  id: number;
  name: string;
  brewery: number;
  brewery_name: string;
  brewery_prefecture: string;
  tokutei_meisho: string;
  rice_variety?: string;
  yeast?: string;
  seimaibuai?: number;
  alcohol_content?: number;
  nihonshudo?: number;
  acidity?: number;
  amino_acid?: number;
  volume?: number;
  hiire_type?: string;
  filtration_type?: string;
  image?: string;
  description?: string;
  average_rating?: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  created_by_id?: number;
  created_by_name?: string;
}

export interface Brewery {
  id: number;
  name: string;
  location: string;
  prefecture: string;
  website?: string;
  founded_year?: number;
  description?: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SakeCreate {
  name: string;
  brewery_name: string;
  tokutei_meisho: string;
  rice_variety?: string;
  yeast?: string;
  seimaibuai?: number;
  alcohol_content?: number;
  nihonshudo?: number;
  acidity?: number;
  amino_acid?: number;
  volume?: number;
  hiire_type?: string;
  filtration_type?: string;
  description?: string;
  image?: string;
}

export interface SakeDetail {
  id: number;
  name: string;
  brewery: Brewery;
  tokutei_meisho: string;
  rice_variety?: string;
  yeast?: string;
  seimaibuai?: number;
  alcohol_content?: number;
  nihonshudo?: number;
  acidity?: number;
  amino_acid?: number;
  volume?: number;
  hiire_type?: string;
  filtration_type?: string;
  description?: string;
  image?: string;
  is_active: boolean;
  average_rating?: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}
