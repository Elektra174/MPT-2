import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface SessionChecklistProps {
  stage: "intake" | "analysis" | "selection" | "execution" | "completion";
  checkedItems: string[];
  onToggle: (itemId: string) => void;
}

const STAGE_CHECKLISTS: Record<string, ChecklistItem[]> = {
  intake: [
    {
      id: "intro",
      label: "Установлено раппортное соединение",
      description: "Клиент чувствует себя комфортно и готов к разговору",
      required: true,
    },
    {
      id: "all-questions",
      label: "Заданы все 4 вопроса о проблеме",
      description: "Вы получили полную информацию о запросе клиента",
      required: true,
    },
    {
      id: "problem-clarity",
      label: "Проблема понята и сформулирована",
      description: "Вы и клиент согласны в определении проблемы",
      required: true,
    },
    {
      id: "motivation",
      label: "Определена мотивация (актуальность > 8/10)",
      description: "Клиент готов работать над этой проблемой",
      required: true,
    },
  ],
  analysis: [
    {
      id: "analysis-questions",
      label: "Заданы уточняющие вопросы анализа",
      description: "Понимаете глубинную причину проблемы",
      required: true,
    },
    {
      id: "category-identified",
      label: "Определена категория проблемы",
      description: "Страхи, убеждения, стратегии, тело и т.д.",
      required: true,
    },
    {
      id: "approach-agreed",
      label: "Согласован подход работы",
      description: "Клиент согласен с выбранной методикой",
      required: true,
    },
  ],
  selection: [
    {
      id: "scripts-reviewed",
      label: "Просмотрены рекомендуемые скрипты",
      description: "Выбран оптимальный скрипт для запроса",
      required: true,
    },
    {
      id: "script-explained",
      label: "Объяснена логика выбранного скрипта",
      description: "Клиент понимает что вы будете делать",
      required: true,
    },
  ],
  execution: [
    {
      id: "bodily-sensations",
      label: "Исследованы телесные ощущения",
      description: "Клиент заметил и описал ощущения в теле",
    },
    {
      id: "visualization",
      label: "Найден образ или метафора",
      description: "Клиент может визуализировать найденное",
    },
    {
      id: "movement-allowed",
      label: "Позволено телесное движение",
      description: "Клиент совершил импульсивное движение",
    },
    {
      id: "metaposition",
      label: "Достигнута метапозиция",
      description: "Клиент смотрит на ситуацию с нового угла",
    },
    {
      id: "integration",
      label: "Проведена интеграция",
      description: "Новое состояние объединено с личностью",
    },
  ],
  completion: [
    {
      id: "summary",
      label: "Проведено резюме сеанса",
      description: "Клиент понимает что было достигнуто",
      required: true,
    },
    {
      id: "homework",
      label: "Задано домашнее задание",
      description: "Клиент знает что делать между сеансами",
    },
    {
      id: "ecology",
      label: "Проведена экологическая проверка",
      description: "Изменения экологичны и безопасны",
    },
    {
      id: "next-session",
      label: "Спланирована следующая сеанс",
      description: "Определена дата и тема работы",
    },
  ],
};

export function SessionChecklist({
  stage,
  checkedItems,
  onToggle,
}: SessionChecklistProps) {
  const items = STAGE_CHECKLISTS[stage] || [];
  const requiredItems = items.filter((i) => i.required);
  const allRequiredChecked = requiredItems.every((i) => checkedItems.includes(i.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {allRequiredChecked ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
          Чек-лист этапа
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => {
            const isChecked = checkedItems.includes(item.id);
            const isRequired = item.required;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onToggle(item.id)}
                data-testid={`checklist-item-${item.id}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isChecked ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isChecked ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {item.label}
                    {isRequired && <span className="text-destructive ml-1">*</span>}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {requiredItems.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            * Обязательные пункты
          </p>
        )}
      </CardContent>
    </Card>
  );
}
