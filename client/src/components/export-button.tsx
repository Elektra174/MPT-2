import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFavorites } from "@/components/favorites-button";
import { getNotes } from "@/components/notes-modal";
import type { TherapyScript } from "@shared/schema";

interface ExportButtonProps {
  scripts: TherapyScript[];
}

export function ExportButton({ scripts }: ExportButtonProps) {
  const handleExport = () => {
    const favorites = getFavorites();
    const notes = getNotes();

    const favoriteScripts = scripts.filter((s) => favorites.includes(s.id));

    const exportData = {
      scripts: favoriteScripts,
      notes,
      exportedAt: Date.now(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mpt-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      data-testid="button-export"
    >
      <Download className="h-4 w-4 mr-2" />
      Экспорт
    </Button>
  );
}
