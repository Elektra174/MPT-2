import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TherapyScript } from "@shared/schema";

interface SearchBarProps {
  scripts: TherapyScript[];
  onSearch: (results: TherapyScript[]) => void;
}

export function SearchBar({ scripts, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      onSearch(scripts);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = scripts.filter((script) => {
      const titleMatch = script.title.toLowerCase().includes(lowerQuery);
      const descMatch = script.description.toLowerCase().includes(lowerQuery);
      const blockMatch = script.blocks.some((b) =>
        b.content.toLowerCase().includes(lowerQuery)
      );
      return titleMatch || descMatch || blockMatch;
    });

    onSearch(results);
  }, [query, scripts, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch(scripts);
  };

  return (
    <div className="relative mb-6">
      <div className="flex items-center gap-2">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Поиск скриптов по названию, описанию или содержанию..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="flex-shrink-0"
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {query && (
        <p className="text-sm text-muted-foreground mt-2">
          Найдено: {scripts.length} скриптов
        </p>
      )}
    </div>
  );
}
