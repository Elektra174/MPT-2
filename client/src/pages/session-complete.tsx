import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, ChevronRight, Check, CircleHelp, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

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

interface SessionSection {
  id: string;
  title: string;
  icon: string;
  items: Array<{
    id: string;
    content: string;
    isAction: boolean;
  }>;
}

const SESSION_SECTIONS: SessionSection[] = [
  {
    id: "summary",
    title: "ПОДВЕДЕНИЕ ИТОГОВ",
    icon: "📋",
    items: [
      {
        id: "sum-1",
        content: "Какие ключевые инсайты ты вынес из сегодняшней сессии?",
        isAction: false,
      },
      {
        id: "sum-2",
        content: "Как бы ты сформулировал главный результат нашей работы сегодня?",
        isAction: false,
      },
      {
        id: "sum-3",
        content: "Что изменилось в твоем восприятии ситуации?",
        isAction: false,
      },
    ],
  },
  {
    id: "homework",
    title: "ДОМАШНИЕ ЗАДАНИЯ",
    icon: "🏠",
    items: [
      {
        id: "hw-1",
        content: "Какие практики внедрения ты готов выполнять между сессиями?",
        isAction: false,
      },
      {
        id: "hw-2",
        content: "Какие конкретные шаги ты планируешь делать до нашей следующей встречи?",
        isAction: false,
      },
      {
        id: "hw-3",
        content: "По каким критериям пойму, что практика работает?",
        isAction: false,
      },
    ],
  },
  {
    id: "ecology",
    title: "ЭКОЛОГИЧЕСКАЯ ПРОВЕРКА",
    icon: "🌿",
    items: [
      {
        id: "eco-1",
        content: "Что может помешать внедрению этих изменений в жизнь?",
        isAction: false,
      },
      {
        id: "eco-2",
        content: "Какой поддержки тебе может не хватать?",
        isAction: false,
      },
      {
        id: "eco-3",
        content: "Есть ли внутреннее сопротивление новому действию?",
        isAction: false,
      },
    ],
  },
  {
    id: "next-session",
    title: "ДОГОВОРЕННОСТИ О СЛЕДУЮЩЕЙ СЕССИИ",
    icon: "📅",
    items: [
      {
        id: "next-1",
        content: "Согласовать дату и время следующей встречи",
        isAction: true,
      },
      {
        id: "next-2",
        content: "Определить формат работы (очно/онлайн)",
        isAction: true,
      },
      {
        id: "next-3",
        content: "Обсудить предварительную тему следующей сессии",
        isAction: true,
      },
    ],
  },
  {
    id: "closure",
    title: "БЛАГОДАРНОСТЬ И ЗАКРЫТИЕ",
    icon: "💝",
    items: [
      {
        id: "cls-1",
        content: "Признать усилия клиента и прогресс в работе",
        isAction: true,
      },
      {
        id: "cls-2",
        content: "Экологичное завершение контакта",
        isAction: true,
      },
      {
        id: "cls-3",
        content: "Ритуал завершения сессии (можно использовать дыхательное упражнение или короткую медитацию)",
        isAction: true,
      },
    ],
  },
];

export default function SessionComplete() {
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => loadCompletedSteps());

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

  const allItems = SESSION_SECTIONS.flatMap(s => s.items);
  const allCompleted = allItems.length > 0 && completedSteps.length === allItems.length;
  const progress = allItems.length > 0 ? Math.round((completedSteps.length / allItems.length) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" data-testid="breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-home">
          Главная
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Завершение сессии</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Завершение сессии
        </h1>
        <p className="text-muted-foreground">
          Полный протокол завершения терапевтической сессии
        </p>
      </div>

      <Card className="mb-8">
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
                  {completedSteps.length} из {allItems.length} пунктов выполнено
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

      <div className="space-y-6">
        {SESSION_SECTIONS.map((section) => (
          <div key={section.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">{section.icon}</div>
              <h2 className="text-lg font-bold text-foreground">
                {section.title}
              </h2>
            </div>

            <div className="space-y-3 pl-11">
              {section.items.map((item) => {
                const isCompleted = completedSteps.includes(item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-md cursor-pointer transition-all hover-elevate ${
                      isCompleted ? "bg-muted/50" : "bg-muted/20"
                    }`}
                    onClick={() => toggleStep(item.id)}
                    data-testid={`item-${item.id}`}
                  >
                    <div className={`
                      flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors mt-0.5
                      ${isCompleted 
                        ? item.isAction 
                          ? "text-success" 
                          : "text-primary"
                        : item.isAction
                          ? "text-muted-foreground/40"
                          : "text-primary/40"
                      }
                    `}>
                      {item.isAction ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <CircleHelp className="h-5 w-5" />
                      )}
                    </div>
                    <p className={`text-sm flex-1 leading-relaxed ${
                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                    }`}>
                      {item.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {allCompleted && (
        <Card className="mt-8 border-success/50 bg-success/5">
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-success mb-2">
              <Check className="h-6 w-6" />
              <span className="font-semibold text-lg">Сессия успешно завершена</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Все пункты протокола выполнены. Вы можете начать новую сессию.
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
