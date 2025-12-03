import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  Printer, 
  Copy, 
  Check,
  CircleHelp,
  FileText,
  AlertCircle,
  Lightbulb,
  Activity,
  ListOrdered,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { ScriptTips } from "@/components/script-tips";
import type { TherapyScript, Category, ScriptBlock } from "@shared/schema";

const HISTORY_KEY = "mpt-script-history";

interface HistoryItem {
  id: string;
  title: string;
  timestamp: number;
}

function loadHistory(): HistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToHistory(script: TherapyScript) {
  try {
    const history = loadHistory();
    const filtered = history.filter((h) => h.id !== script.id);
    const newItem: HistoryItem = {
      id: script.id,
      title: script.title,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...filtered].slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
  }
}

function getDifficultyBadge(difficulty: string) {
  switch (difficulty) {
    case "beginner":
      return <Badge className="bg-success text-success-foreground">Базовый</Badge>;
    case "intermediate":
      return <Badge className="bg-warning text-warning-foreground">Средний</Badge>;
    case "advanced":
      return <Badge className="bg-destructive text-destructive-foreground">Продвинутый</Badge>;
    default:
      return <Badge variant="secondary">{difficulty}</Badge>;
  }
}

function BlockIcon({ type }: { type: string }) {
  switch (type) {
    case "question":
      return <CircleHelp className="h-4 w-4 text-primary" />;
    case "instruction":
      return <FileText className="h-4 w-4 text-accent-foreground" />;
    case "note":
      return <AlertCircle className="h-4 w-4 text-warning" />;
    case "theory":
      return <Lightbulb className="h-4 w-4 text-foreground" />;
    case "practice":
      return <Activity className="h-4 w-4 text-success" />;
    case "step":
      return <ListOrdered className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
}

function getBlockClass(type: string): string {
  switch (type) {
    case "heading":
      return "";
    case "question":
      return "block-question";
    case "instruction":
      return "block-instruction";
    case "note":
      return "block-note";
    case "theory":
      return "block-theory";
    case "practice":
      return "block-practice";
    case "step":
      return "block-step";
    case "list":
      return "my-4";
    default:
      return "my-3";
  }
}

function ContentBlock({ block }: { block: ScriptBlock }) {
  if (block.type === "list") {
    return (
      <div className={getBlockClass(block.type)} data-testid={`block-${block.id}`}>
        <p className="font-medium text-foreground mb-2">{block.content}</p>
        {block.subContent && block.subContent.length > 0 && (
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            {block.subContent.map((item: string, idx: number) => (
              <li key={idx} className="text-sm">{item}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className={getBlockClass(block.type)} data-testid={`block-${block.id}`}>
      <div className="flex items-start gap-3">
        <BlockIcon type={block.type} />
        <p className="flex-1 text-foreground leading-relaxed">{block.content}</p>
      </div>
    </div>
  );
}

interface Section {
  heading: ScriptBlock;
  blocks: ScriptBlock[];
}

function groupBlocksIntoSections(blocks: ScriptBlock[]): Section[] {
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  for (const block of blocks) {
    if (block.type === "heading") {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { heading: block, blocks: [] };
    } else if (currentSection) {
      currentSection.blocks.push(block);
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

function CollapsibleSection({ section, forceOpen }: { section: Section; forceOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);
  
  const questionCount = section.blocks.filter((b: ScriptBlock) => b.type === "question").length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger className="flex items-center gap-3 w-full text-left py-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer group" data-testid={`toggle-section-${section.heading.id}`}>
        <div className="flex items-center justify-center w-6 h-6 rounded border border-border bg-background group-hover:bg-muted transition-colors">
          {isOpen ? (
            <Minus className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Plus className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <h2 className="text-lg font-semibold text-foreground flex-1" data-testid={`heading-${section.heading.id}`}>
          {section.heading.content}
        </h2>
        {questionCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {questionCount} {questionCount === 1 ? "вопрос" : questionCount < 5 ? "вопроса" : "вопросов"}
          </Badge>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 pl-9 border-l-2 border-border ml-3">
          {section.blocks.map((block: ScriptBlock) => (
            <ContentBlock key={block.id} block={block} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ScriptPage() {
  const [, params] = useRoute("/script/:id");
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [allExpanded, setAllExpanded] = useState<boolean | undefined>(undefined);

  const scriptId = params?.id;

  const { data: script, isLoading: loadingScript } = useQuery<TherapyScript>({
    queryKey: ["/api/scripts", scriptId],
    enabled: !!scriptId,
  });

  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", script?.categoryId],
    enabled: !!script?.categoryId,
  });

  useEffect(() => {
    if (script) {
      saveToHistory(script);
    }
  }, [script]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyQuestions = async () => {
    if (!script) return;
    
    const questions = script.blocks
      .filter((b) => b.type === "question")
      .map((b) => b.content)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(questions);
      setCopied(true);
      toast({
        title: "Скопировано",
        description: "Вопросы скопированы в буфер обмена",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать текст",
        variant: "destructive",
      });
    }
  };

  if (loadingScript) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-semibold text-foreground mb-4">Скрипт не найден</h1>
        <p className="text-muted-foreground mb-6">Запрошенный скрипт не существует или был удалён.</p>
        <Link href="/">
          <Button variant="outline" data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="print:bg-white">
      <div className="p-6 max-w-4xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 no-print" data-testid="breadcrumb">
          <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-home">
            Главная
          </Link>
          <ChevronRight className="h-4 w-4" />
          {category && (
            <>
              <span className="flex items-center gap-1">
                <span>{category.emoji}</span>
                <span>{category.title}</span>
              </span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-foreground font-medium">{script.title}</span>
        </nav>

        <Card className="mb-6 no-print">
          <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <CardTitle className="text-xl" data-testid="text-script-title">{script.title}</CardTitle>
                {getDifficultyBadge(script.difficulty)}
              </div>
              <p className="text-sm text-muted-foreground">{script.description}</p>
              {script.context && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  <span className="font-medium">Контекст:</span> {script.context}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print">
                <Printer className="h-4 w-4 mr-2" />
                Печать
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyQuestions} data-testid="button-copy">
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Вопросы
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="print:pt-0">
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold">{script.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{script.description}</p>
          </div>

          <div className="script-content">
            {groupBlocksIntoSections(script.blocks).map((section: Section) => (
              <CollapsibleSection key={section.heading.id} section={section} />
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border no-print">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href="/">
              <Button variant="ghost" data-testid="button-back">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад к списку
              </Button>
            </Link>
            <div className="flex gap-2">
              <Link href="/practices">
                <Button variant="outline" data-testid="button-to-practices">
                  Практики внедрения
                </Button>
              </Link>
              <Link href="/session-complete">
                <Button variant="default" data-testid="button-complete-session">
                  Завершить сессию
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
