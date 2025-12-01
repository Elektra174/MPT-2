import { useState, useEffect } from "react";
import { Link } from "wouter";
import { History, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const HISTORY_KEY = "mpt-script-history";

interface HistoryItem {
  id: string;
  title: string;
  timestamp: number;
}

function loadHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
  }
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days === 1) return "вчера";
  return `${days} дн. назад`;
}

export function SessionHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setHistory(loadHistory());
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2"
          data-testid="button-history"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">История</span>
          {history.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {history.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <p className="font-medium text-sm">История просмотров</p>
          {history.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={clearHistory}
              data-testid="button-clear-history"
            >
              Очистить
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[300px]">
          {history.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              История пуста
            </div>
          ) : (
            <div className="p-2">
              {history.map((item) => (
                <Link key={item.id} href={`/script/${item.id}`}>
                  <div 
                    className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer group"
                    onClick={() => setOpen(false)}
                    data-testid={`link-history-${item.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => removeItem(item.id, e)}
                      data-testid={`button-remove-history-${item.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
