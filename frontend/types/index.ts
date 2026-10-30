export interface User {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  active: boolean;
}

export interface Tour {
  _id: string;
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  price: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  guides: User[];
  startLocation?: {
    description: string;
    type: string;
    coordinates: number[];
  };
  locations?: any[];
  startDates?: string[];
  reviews?: Review[];
}

export interface Review {
  _id: string;
  review: string;
  rating: number;
  createdAt: string;
  tour: string | Tour; // Can be ID or populated Tour object
  user: User; // Populated user object
}

export interface Booking {
  _id: string;
  tour: Tour;
  user: User;
  price: number;
  createdAt: string;
  paid: boolean;
}



