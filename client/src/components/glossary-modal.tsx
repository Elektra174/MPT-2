import { BookOpen, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMemo } from "react";

export const MPT_GLOSSARY = {
  "Метапозиция": "Позиция, с которой клиент смотрит на ситуацию глазами найденного ресурса или образа. Помогает увидеть проблему с новой перспективы.",
  "Энергия потребности": "Глубинная мотивационная сила, которая движет действиями клиента. Часто находится на уровне чувств и ощущений.",
  "Архетип": "Универсальный образец поведения и переживания. В МПТ исследуются архетипы в психике человека.",
  "Телесная блокировка": "Мышечное и эмоциональное сжатие в теле, которое удерживает переживание или стресс.",
  "Теневое желание": "Подавленное или неосознанное желание, которое проявляется через противодействие или проекции.",
  "Проекция": "Приписывание своих качеств, чувств или мотивов другому человеку.",
  "Светлая тень": "Положительные качества, которые человек отрицает в себе и видит в других.",
  "Темная тень": "Негативные качества, которые человек подавляет и проецирует на других.",
  "Сопротивление": "Внутренние препятствия к изменениям, часто связанные со страхом или убеждениями.",
  "Стратегия": "Привычный способ действий и мышления, который клиент использует для достижения целей.",
  "Переворот убеждения": "Техника изменения ограничивающего убеждения на более полезное.",
  "Интеграция": "Процесс объединения найденного ресурса или понимания с личностью клиента.",
  "Эталонное состояние": "Желаемое психоэмоциональное состояние, в котором клиент хочет себя чувствовать.",
  "Диссоциация": "Техника отделения от переживания для лучшего анализа ситуации.",
  "Якорь": "Сенсорный триггер (телесный, звуковой, зрительный), связанный с определённым состоянием.",
  "Фрейм": "Способ интерпретации события или ситуации, изменение фрейма меняет восприятие.",
};

export function GlossaryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTerms = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return Object.entries(MPT_GLOSSARY).filter(
      ([term, definition]) =>
        term.toLowerCase().includes(lowerQuery) ||
        definition.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-glossary">
          <BookOpen className="h-4 w-4" />
          Глоссарий МПТ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" data-testid="dialog-glossary">
        <DialogHeader>
          <DialogTitle>Глоссарий МПТ терминов</DialogTitle>
          <DialogDescription>
            Справочник основных терминов Мета-персональной терапии
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Поиск по термину или определению..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            data-testid="input-glossary-search"
          />

          <ScrollArea className="h-96 border rounded-md p-4">
            <div className="space-y-4 pr-4">
              {filteredTerms.length > 0 ? (
                filteredTerms.map(([term, definition]) => (
                  <div
                    key={term}
                    className="pb-4 border-b last:border-b-0"
                    data-testid={`glossary-term-${term}`}
                  >
                    <h3 className="font-semibold text-foreground mb-1">{term}</h3>
                    <p className="text-sm text-muted-foreground">{definition}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Ничего не найдено
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
