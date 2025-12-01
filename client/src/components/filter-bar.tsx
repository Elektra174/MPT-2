import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { Category, DifficultyLevel } from "@shared/schema";

interface FilterBarProps {
  categories: Category[];
  selectedCategory: string | null;
  selectedDifficulty: DifficultyLevel | null;
  onCategoryChange: (categoryId: string | null) => void;
  onDifficultyChange: (difficulty: DifficultyLevel | null) => void;
}

export function FilterBar({
  categories,
  selectedCategory,
  selectedDifficulty,
  onCategoryChange,
  onDifficultyChange,
}: FilterBarProps) {
  const hasFilters = selectedCategory || selectedDifficulty;

  return (
    <div className="flex flex-wrap gap-3 mb-6 items-center">
      <div className="flex gap-2 items-center flex-1 min-w-0">
        <Select
          value={selectedCategory || "all"}
          onValueChange={(val) => onCategoryChange(val === "all" ? null : val)}
        >
          <SelectTrigger className="w-[180px]" data-testid="select-category">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.emoji} {cat.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedDifficulty || "all"}
          onValueChange={(val) => onDifficultyChange(val === "all" ? null : (val as DifficultyLevel))}
        >
          <SelectTrigger className="w-[160px]" data-testid="select-difficulty">
            <SelectValue placeholder="Уровень сложности" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все уровни</SelectItem>
            <SelectItem value="beginner">Базовый</SelectItem>
            <SelectItem value="intermediate">Средний</SelectItem>
            <SelectItem value="advanced">Продвинутый</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onCategoryChange(null);
            onDifficultyChange(null);
          }}
          className="flex-shrink-0"
          data-testid="button-clear-filters"
        >
          <X className="h-4 w-4 mr-1" />
          Сбросить
        </Button>
      )}
    </div>
  );
}
