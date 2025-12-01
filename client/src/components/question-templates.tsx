import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

const QUESTION_TEMPLATES = {
  intake: [
    "Расскажи подробнее, как это началось?",
    "Что для тебя самое сложное в этой ситуации?",
    "Как это влияет на твою жизнь?",
    "Что ты чувствуешь, когда думаешь об этом?",
  ],
  analysis: [
    "Как это связано с твоими убеждениями?",
    "Какой страх стоит за этим?",
    "Что ты делаешь обычно в такой ситуации?",
    "Что это означает для тебя?",
  ],
  execution: [
    "Что ты ощущаешь в теле прямо сейчас?",
    "Где именно локализуется это ощущение?",
    "На что это похоже?",
    "Есть ли у этого цвет или форма?",
    "Если бы это было существом, на кого оно было бы похоже?",
    "Чего хочет это чувство?",
  ],
  completion: [
    "Что ты сейчас понимаешь по-новому?",
    "Как это изменит твои действия?",
    "Что ты будешь делать в следующий раз?",
    "Как ты себя чувствуешь сейчас?",
  ],
};

export function QuestionTemplates({ stage }: { stage: "intake" | "analysis" | "execution" | "completion" }) {
  const templates = QUESTION_TEMPLATES[stage] || [];

  if (!templates.length) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-auto py-2" data-testid={`button-templates-${stage}`}>
          <HelpCircle className="h-4 w-4 text-cyan-500" />
          <span className="text-sm">Примеры вопросов</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" data-testid="dialog-question-templates">
        <DialogHeader>
          <DialogTitle>Примеры вопросов</DialogTitle>
          <DialogDescription>
            Используйте эти вопросы как шаблон для формулировки собственных вопросов
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {templates.map((question, i) => (
            <Card key={i} className="hover:bg-muted/50 cursor-pointer transition-colors" data-testid={`template-question-${i}`}>
              <CardContent className="pt-4">
                <p className="text-sm">"{question}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
