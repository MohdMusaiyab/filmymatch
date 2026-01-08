export interface Collection {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "FOLLOWERS";
  isDraft: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  postCount: number;
}

export interface Highlight {
  id: number;
  title: string;
  category: string;
  creator: string;
  year?: string;
  episode?: string;
  timestamp?: string;
  content: string;
  timeAgo: string;
  visibility: string;
  icon: string;
}

export interface Draft {
  id: number;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  timeAgo: string;
  icon: string;
  createdAt: string;
}

export type ActiveTab = 'home' | 'explore' | 'library' | 'saved';

export type Visibility = 'public' | 'private' | 'followers' | 'draft';