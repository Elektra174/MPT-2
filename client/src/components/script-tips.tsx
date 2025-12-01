import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface BlockTip {
  type: string;
  tip: string;
  example?: string;
  warning?: string;
}

const BLOCK_TIPS: Record<string, BlockTip> = {
  heading: {
    type: "heading",
    tip: "Это заголовок раздела. Объясните клиенту, что вы сейчас будете делать.",
  },
  question: {
    type: "question",
    tip: "Задавайте открытые вопросы. Слушайте внимательно ответ клиента.",
    example: "Если клиент затрудняется - помогите формулировкой 'если бы...'",
    warning: "Не подсказывайте и не интерпретируйте ответ. Только уточняйте.",
  },
  instruction: {
    type: "instruction",
    tip: "Это инструкция для вас. Выполните указанное действие вместе с клиентом.",
    example: "Например: позвольте телу двигаться так, как оно хочет",
  },
  note: {
    type: "note",
    tip: "Это служебная заметка. Используйте её для подготовки к следующему шагу.",
    warning: "Не передавайте эту информацию клиенту напрямую.",
  },
  step: {
    type: "step",
    tip: "Это номерованный шаг. Проводите его системно.",
  },
  theory: {
    type: "theory",
    tip: "Теоретическое объяснение. Рассказывайте на языке, понятном клиенту.",
  },
  practice: {
    type: "practice",
    tip: "Это практическое упражнение. Позвольте клиенту почувствовать его эффект.",
  },
  list: {
    type: "list",
    tip: "Список элементов. Проходите их по порядку, не пропускайте.",
  },
};

interface ScriptTipsProps {
  blockType: string;
}

export function ScriptTips({ blockType }: ScriptTipsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tip = BLOCK_TIPS[blockType];

  if (!tip) return null;

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start gap-2 h-auto py-2"
        data-testid={`button-tip-${blockType}`}
      >
        <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0" />
        <span className="text-sm">Подсказка для этого шага</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 ml-auto" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-auto" />
        )}
      </Button>

      {isOpen && (
        <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-md text-sm space-y-2">
          <p className="text-foreground font-medium">{tip.tip}</p>
          {tip.example && (
            <p className="text-muted-foreground flex gap-2">
              <span className="flex-shrink-0">💡</span>
              <span>{tip.example}</span>
            </p>
          )}
          {tip.warning && (
            <p className="text-destructive flex gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{tip.warning}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
