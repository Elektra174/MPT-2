import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, ChevronRight, Check, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import type { SessionCompletionStep } from "@shared/schema";

const COMPLETED_STEPS_KEY = "mpt-completed-steps";

function loadCompletedSteps(): string[] {
  try {
    const stored = localStorage.getItem(COMPLETED_STEPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCompletedSteps(steps: string[]) {
  try {
    localStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify(steps));
  } catch {
  }
}

export default function SessionComplete() {
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => loadCompletedSteps());

  const { data: steps = [], isLoading } = useQuery<SessionCompletionStep[]>({
    queryKey: ["/api/session-completion"],
  });

  useEffect(() => {
    saveCompletedSteps(completedSteps);
  }, [completedSteps]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) {
        return prev.filter((id) => id !== stepId);
      }
      return [...prev, stepId];
    });
  };

  const resetProgress = () => {
    setCompletedSteps([]);
  };

  const allCompleted = steps.length > 0 && completedSteps.length === steps.length;
  const progress = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" data-testid="breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-home">
          Главная
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Завершение сессии</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Протокол завершения сессии
        </h1>
        <p className="text-muted-foreground">
          Пройдите все шаги для корректного завершения терапевтической сессии.
          Отмечайте выполненные пункты для отслеживания прогресса.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div 
                className="relative w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${progress * 3.6}deg, hsl(var(--muted)) 0deg)`
                }}
              >
                <div className="absolute inset-1 bg-card rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold" data-testid="text-progress">{progress}%</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {allCompleted ? "Сессия завершена" : "Прогресс завершения"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {completedSteps.length} из {steps.length} шагов выполнено
                </p>
              </div>
            </div>
            {completedSteps.length > 0 && (
              <Button variant="outline" size="sm" onClick={resetProgress} data-testid="button-reset">
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          
          return (
            <Card 
              key={step.id}
              className={`cursor-pointer transition-all hover-elevate ${isCompleted ? "border-success/50" : ""}`}
              onClick={() => toggleStep(step.id)}
              data-testid={`card-step-${step.id}`}
            >
              <CardHeader className="flex flex-row items-start gap-4">
                <div className={`
                  flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors
                  ${isCompleted 
                    ? "bg-success border-success text-success-foreground" 
                    : "border-muted-foreground/30 text-muted-foreground"
                  }
                `}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className={`text-base ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                    {step.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {step.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {allCompleted && (
        <Card className="mt-6 border-success/50 bg-success/5">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-success mb-2">
              <Check className="h-6 w-6" />
              <span className="font-semibold text-lg">Сессия успешно завершена</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Все шаги протокола выполнены. Вы можете начать новую сессию.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link href="/">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
          </Link>
          <Link href="/practices">
            <Button variant="outline" data-testid="button-to-practices">
              Практики внедрения
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
