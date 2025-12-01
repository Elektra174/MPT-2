import { BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const LEARNING_GUIDES = {
  intake: {
    title: "Начало сеанса",
    why: "Правильный запрос - половина решения. Глубоко поймите, что беспокоит клиента.",
    steps: [
      {
        step: "1. Установите раппорт",
        why: "Клиент должен чувствовать себя в безопасности",
        example: "Уделите время неспешному началу, покажите интерес",
      },
      {
        step: "2. Задайте все 4 вопроса",
        why: "Каждый вопрос раскрывает разные аспекты",
        example: "Суть, длительность, попытки, желаемый результат",
      },
    ],
    mistakes: [
      "Переход к работе без полного понимания",
      "Подсказки вместо слушания",
      "Недостаточное внимание к чувствам",
    ],
  },
  analysis: {
    title: "Анализ запроса",
    why: "Определите уровень работы: убеждения, стратегии, тело или эмоции?",
    steps: [
      {
        step: "1. Определите категорию",
        why: "Разные уровни требуют разных подходов",
        example: "Страхи → исследование. Убеждения → переворот.",
      },
    ],
    mistakes: ["Выбор инструмента без анализа", "Работа без согласия клиента"],
  },
  execution: {
    title: "Выполнение скрипта",
    why: "Самый важный этап. Проходите блоки последовательно.",
    steps: [
      {
        step: "1. Ищите телесные ощущения",
        why: "Тело показывает истину",
        example: "'Что ты ощущаешь в теле?' - слушайте детали",
      },
    ],
    mistakes: ["Спешка", "Пропуск телесных ощущений", "Недостаточная интеграция"],
  },
};

export function LearningMode() {
  const [selectedGuide, setSelectedGuide] = useState<keyof typeof LEARNING_GUIDES | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-learning-mode">
          <BookOpen className="h-4 w-4" />
          Режим обучения
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" data-testid="dialog-learning">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Режим обучения МПТ</DialogTitle>
          <DialogDescription>
            Пошаговое руководство для начинающего терапевта
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-hidden">
          {!selectedGuide ? (
            <div className="grid grid-cols-1 gap-2 pr-4">
              {(Object.keys(LEARNING_GUIDES) as Array<keyof typeof LEARNING_GUIDES>).map(
                (key) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => setSelectedGuide(key)}
                    data-testid={`button-guide-${key}`}
                  >
                    <div className="text-left">
                      <p className="font-medium">{LEARNING_GUIDES[key].title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {LEARNING_GUIDES[key].why}
                      </p>
                    </div>
                  </Button>
                )
              )}
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedGuide(null)}
                data-testid="button-back-guides"
              >
                ← Назад
              </Button>

              <h2 className="font-semibold text-lg">
                {LEARNING_GUIDES[selectedGuide].title}
              </h2>

              <Card className="bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    {LEARNING_GUIDES[selectedGuide].why}
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {LEARNING_GUIDES[selectedGuide].steps.map((item, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-base">{item.step}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm font-medium">{item.why}</p>
                      <p className="text-sm text-muted-foreground italic">💡 {item.example}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-700" />
                    Частые ошибки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {LEARNING_GUIDES[selectedGuide].mistakes.map((mistake, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-amber-700">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
