import { Card } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";

type SessionStageType = "intake" | "analysis" | "selection" | "execution" | "completion";

const STAGES = [
  { id: "intake", label: "Начало сеанса", icon: "🎯" },
  { id: "analysis", label: "Анализ запроса", icon: "🔍" },
  { id: "selection", label: "Выбор скрипта", icon: "📋" },
  { id: "execution", label: "Выполнение", icon: "⚙️" },
  { id: "completion", label: "Завершение", icon: "✓" },
];

export function SessionRoadmap({ currentStage }: { currentStage: SessionStageType }) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-muted-foreground mb-3">Дорожная карта сеанса</p>
      <div className="flex items-center gap-2 flex-wrap">
        {STAGES.map((stage, i) => {
          const isActive = stage.id === currentStage;
          const isCompleted = i < currentIndex;

          return (
            <div key={stage.id} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/50"
                    : isCompleted
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
                data-testid={`roadmap-stage-${stage.id}`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stage.icon}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${isActive ? "text-primary font-semibold" : isCompleted ? "text-success" : "text-muted-foreground"}`}
              >
                {stage.label}
              </span>
              {i < STAGES.length - 1 && (
                <ChevronRight className={`h-4 w-4 mx-1 ${i < currentIndex ? "text-success" : "text-muted-foreground/30"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
