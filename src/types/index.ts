export interface Collection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string | null;
  visibility: "PUBLIC" | "PRIVATE" | "FOLLOWERS";
  createdAt: string;
  updatedAt: string;
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
  type: string;
  status: string;
  timeAgo: string;
  icon: string;
}

export type ActiveTab = 'home' | 'explore' | 'library';