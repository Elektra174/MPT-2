import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export interface SessionReportData {
  clientName?: string;
  date: Date;
  scriptTitle: string;
  scriptCategory: string;
  clientAnswers?: Record<string, string>;
  therapistNotes?: string;
  homework?: string;
  nextSession?: string;
  duration: number; // in minutes
}

function generatePDF(data: SessionReportData): void {
  const doc = `
МПТ - ОТЧЕТ О СЕАНСЕ
═════════════════════════════════════════

Дата: ${data.date.toLocaleDateString("ru-RU")}
Клиент: ${data.clientName || "Не указан"}
Продолжительность: ${data.duration} минут

СКРИПТ
─────────────────────────────────────────
Название: ${data.scriptTitle}
Категория: ${data.scriptCategory}

${data.clientAnswers && Object.keys(data.clientAnswers).length > 0 ? `
ОТВЕТЫ КЛИЕНТА
─────────────────────────────────────────
${Object.entries(data.clientAnswers)
  .map(([q, a]) => `Q: ${q}\nA: ${a}`)
  .join("\n\n")}
` : ""}

${data.therapistNotes ? `
ЗАМЕТКИ ТЕРАПЕВТА
─────────────────────────────────────────
${data.therapistNotes}
` : ""}

${data.homework ? `
ДОМАШНЕЕ ЗАДАНИЕ
─────────────────────────────────────────
${data.homework}
` : ""}

${data.nextSession ? `
СЛЕДУЮЩИЙ СЕАНС
─────────────────────────────────────────
${data.nextSession}
` : ""}

═════════════════════════════════════════
Сгенерировано: МПТ Скрипты
`;

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(doc)
  );
  element.setAttribute(
    "download",
    `mpt-session-${data.date.toISOString().split("T")[0]}.txt`
  );
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

interface SessionReportProps {
  data: SessionReportData;
}

export function SessionReport({ data }: SessionReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [homework, setHomework] = useState(data.homework || "");
  const [nextSession, setNextSession] = useState(data.nextSession || "");
  const [notes, setNotes] = useState(data.therapistNotes || "");

  const handleExport = () => {
    generatePDF({
      ...data,
      homework,
      nextSession,
      therapistNotes: notes,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-session-report">
          <Download className="h-4 w-4" />
          Отчет сеанса
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-96" data-testid="dialog-session-report">
        <DialogHeader>
          <DialogTitle>Отчет сеанса</DialogTitle>
          <DialogDescription>
            Заполните информацию и создайте отчет для клиента
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-80 overflow-y-auto">
          <div>
            <label className="text-sm font-medium">Домашнее задание</label>
            <Textarea
              placeholder="Какое задание вы даете клиенту для закрепления?"
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              className="mt-1"
              data-testid="textarea-homework"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Заметки терапевта</label>
            <Textarea
              placeholder="Ключевые моменты сеанса, наблюдения..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              data-testid="textarea-notes"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Следующий сеанс</label>
            <Input
              placeholder="Дата и тема следующего сеанса"
              value={nextSession}
              onChange={(e) => setNextSession(e.target.value)}
              className="mt-1"
              data-testid="input-next-session"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              className="flex-1"
              data-testid="button-export-report"
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать отчет
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
