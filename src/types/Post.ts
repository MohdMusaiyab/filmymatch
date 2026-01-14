export interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: string;
  coverImage?: string;
  user: {
    id: string;
    username: string;
    avatar?: string | null;
  };
  images: {
    id: string;
    url: string;
    description?: string | null;
  }[];
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string;
  tags?: string[];
  isDraft?: boolean;
  linkTo?: string;
  
  // --- ADD THESE TWO LINES ---
  isLiked: boolean;   // Marks if the current user has liked this
  isSaved: boolean;   // Marks if the current user has saved this
}