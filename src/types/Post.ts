export interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: string;
  coverImage?: string; // ✅ Make optional to match usage
  user: {
    id: string;
    username: string;
    avatar?: string | null; // ✅ Make optional to match usage
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
  linkTo?: string; // ✅ new prop to allow dynamic link
  isSaved: boolean; 
}
