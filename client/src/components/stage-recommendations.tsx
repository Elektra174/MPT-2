import { Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StageRecommendation {
  stage: string;
  duration: string;
  tips: string[];
  warning?: string;
}

const STAGE_RECOMMENDATIONS: Record<string, StageRecommendation> = {
  intake: {
    stage: "Начало сеанса",
    duration: "10-15 минут",
    tips: [
      "Создайте атмосферу безопасности и доверия",
      "Слушайте активно, не прерывайте клиента",
      "Записывайте ключевые слова для дальнейшей работы",
      "Убедитесь, что проблема актуальна (>8/10)",
    ],
    warning: "Не торопитесь - правильный запрос - половина решения",
  },
  analysis: {
    stage: "Анализ запроса",
    duration: "5-10 минут",
    tips: [
      "Задавайте уточняющие вопросы",
      "Определите уровень проблемы (убеждения, стратегии, тело, эмоции)",
      "Проверьте понимание клиентом предложенного подхода",
    ],
    warning: "Если клиент сомневается - вернитесь к этапу анализа",
  },
  selection: {
    stage: "Выбор скрипта",
    duration: "3-5 минут",
    tips: [
      "Предложите 2-3 наиболее подходящих скрипта",
      "Объясните логику выбора",
      "Позвольте клиенту выбрать, если есть несколько вариантов",
    ],
  },
  execution: {
    stage: "Выполнение скрипта",
    duration: "25-35 минут",
    tips: [
      "Проходите блоки по порядку, не пропускайте",
      "Давайте клиенту время на осознание",
      "Ищите телесные ощущения и образы",
      "Позвольте движение если оно возникает",
      "Проверьте интеграцию перед окончанием",
    ],
    warning: "Это самый важный этап - не спешите",
  },
  completion: {
    stage: "Завершение сеанса",
    duration: "5-10 минут",
    tips: [
      "Суммируйте что было достигнуто",
      "Дайте домашнее задание для закрепления",
      "Проведите экологическую проверку",
      "Спланируйте следующую сеанс",
    ],
  },
};

interface StageRecommendationsProps {
  stage: "intake" | "analysis" | "selection" | "execution" | "completion";
}

export function StageRecommendations({ stage }: StageRecommendationsProps) {
  const rec = STAGE_RECOMMENDATIONS[stage];

  if (!rec) return null;

  return (
    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Рекомендуемое время: {rec.duration}
            </span>
          </div>

          <div className="space-y-2">
            {rec.tips.map((tip, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                <span className="text-foreground">{tip}</span>
              </div>
            ))}
          </div>

          {rec.warning && (
            <div className="flex gap-2 mt-3 p-2 bg-amber-100 dark:bg-amber-950/40 rounded text-sm">
              <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-amber-900 dark:text-amber-100">{rec.warning}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
