import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAVORITES_KEY = "mpt-favorites";

interface FavoritesButtonProps {
  scriptId: string;
  size?: "default" | "sm" | "lg" | "icon";
}

function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
  }
}

export function FavoritesButton({ scriptId, size = "sm" }: FavoritesButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const fav = loadFavorites();
    setFavorites(fav);
    setIsFavorite(fav.includes(scriptId));
  }, [scriptId]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const updated = isFavorite
      ? favorites.filter((id) => id !== scriptId)
      : [...favorites, scriptId];

    setFavorites(updated);
    setIsFavorite(!isFavorite);
    saveFavorites(updated);
  };

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size={size}
      onClick={toggleFavorite}
      className={isFavorite ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
      data-testid={`button-favorite-${scriptId}`}
    >
      <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
    </Button>
  );
}

export function getFavorites(): string[] {
  return loadFavorites();
}
