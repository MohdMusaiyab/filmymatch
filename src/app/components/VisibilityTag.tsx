import { Visibility } from "@/types";

interface VisibilityTagProps {
  visibility: string;
}

const visibilityStyles: Record<Visibility, string> = {
  public: "bg-green-100 text-green-800",
  private: "bg-blue-100 text-blue-800",
  followers: "bg-orange-100 text-orange-800",
  draft: "bg-yellow-100 text-yellow-800",
};

export const VisibilityTag = ({ visibility }: VisibilityTagProps) => {
  const normalized = visibility.toLowerCase() as Visibility;

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${visibilityStyles[normalized]}`}
    >
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
};
