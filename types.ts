
export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  date: string;
}

export interface CosplayPhoto {
  id: string;
  url: string;
  caption?: string;
  likes: string[]; // Array of User IDs who liked the photo
  saveCount?: number;
  comments: Comment[];
}

export interface CosplaySet {
  id: string;
  character: string;
  series: string;
  date: string;
  coverImage: string;
  photos: CosplayPhoto[];
  description: string;
  featured: boolean;
}

export interface Series {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // In a real app, this would be hashed. Storing plain for demo as per constraints.
  dob: string;
  isAdmin: boolean;
  savedPhotos: string[]; // Array of Photo IDs
  profilePicture?: string;
  isBanned?: boolean; // New flag for ban status
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
  profilePicture?: string;
}

export interface SocialLinks {
  instagram: string;
  tiktok: string;
  email: string;
}

export type ThemeMode = 'light' | 'dark';
