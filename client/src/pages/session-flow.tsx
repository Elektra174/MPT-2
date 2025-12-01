import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, ChevronRight, Play, AlertCircle, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { SessionRoadmap } from "@/components/session-roadmap";
import { QuestionTemplates } from "@/components/question-templates";
import { SessionChecklist } from "@/components/session-checklist";
import { StageRecommendations } from "@/components/stage-recommendations";
import type { Category, TherapyScript } from "@shared/schema";

type SessionStage = "intake" | "analysis" | "selection" | "execution" | "completion";

interface SessionState {
  stage: SessionStage;
  clientProblem: string;
  analysis: string;
  selectedScriptId: string | null;
  currentBlockIndex: number;
}

interface ChecklistState {
  [key: string]: string[];
}

const INTAKE_QUESTIONS = [
  "Какая проблема или ситуация привела тебя на сеанс?",
  "Как долго ты испытываешь эту проблему?",
  "Что ты уже пробовал делать для её решения?",
  "Какой идеальный результат ты хочешь получить?",
];

const ANALYSIS_QUESTIONS = [
  "Это больше связано со страхами, убеждениями или стратегиями?",
  "Есть ли здесь блокировка на уровне тела или эмоций?",
  "Нужна ли работа с идентичностью или это работа с конкретной ситуацией?",
  "Какую поддержку ты ищешь в первую очередь?",
];

export default function SessionFlow() {
  const { toast } = useToast();
  const [sessionState, setSessionState] = useState<SessionState>({
    stage: "intake",
    clientProblem: "",
    analysis: "",
    selectedScriptId: null,
    currentBlockIndex: 0,
  });

  const [intakeAnswers, setIntakeAnswers] = useState<string[]>(["", "", "", ""]);
  const [analysisAnswers, setAnalysisAnswers] = useState<string[]>(["", "", "", ""]);
  const [checklist, setChecklist] = useState<ChecklistState>({
    intake: [],
    analysis: [],
    selection: [],
    execution: [],
    completion: [],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: scripts = [] } = useQuery<TherapyScript[]>({
    queryKey: ["/api/scripts"],
  });

  const selectedScript = scripts.find((s) => s.id === sessionState.selectedScriptId);

  const showStageNotification = (stageName: string) => {
    toast({
      title: stageName,
      description: "Вы перешли на новый этап сеанса",
      duration: 3000,
    });
  };

  const getRecommendedScripts = () => {
    const problem = sessionState.clientProblem.toLowerCase();
    const analysis = sessionState.analysis.toLowerCase();
    
    let recommended: TherapyScript[] = [];

    if (analysis.includes("страх")) {
      recommended = scripts.filter((s) => s.categoryId === "fears");
    } else if (analysis.includes("убежд")) {
      recommended = scripts.filter((s) => s.categoryId === "beliefs");
    } else if (analysis.includes("стратег")) {
      recommended = scripts.filter((s) => s.categoryId === "strategies");
    } else if (analysis.includes("тело") || analysis.includes("блокиров")) {
      recommended = scripts.filter((s) => s.categoryId === "body");
    } else if (analysis.includes("идентич")) {
      recommended = scripts.filter((s) => s.categoryId === "identity");
    } else if (analysis.includes("проекц")) {
      recommended = scripts.filter((s) => s.categoryId === "projections");
    } else if (analysis.includes("ресурс") || analysis.includes("денег")) {
      recommended = scripts.filter((s) => s.categoryId === "resources");
    } else if (analysis.includes("потреб")) {
      recommended = scripts.filter((s) => s.categoryId === "needs");
    }

    return recommended.sort((a, b) => a.order - b.order).slice(0, 5);
  };

  const handleIntakeNext = () => {
    const problem = intakeAnswers.filter((a) => a.trim()).join(" ");
    setSessionState((prev) => ({
      ...prev,
      stage: "analysis",
      clientProblem: problem,
    }));
    showStageNotification("Анализ запроса");
  };

  const handleAnalysisNext = () => {
    const analysis = analysisAnswers.filter((a) => a.trim()).join(" ");
    setSessionState((prev) => ({
      ...prev,
      stage: "selection",
      analysis: analysis,
    }));
    showStageNotification("Выбор скрипта");
  };

  const handleSelectScript = (scriptId: string) => {
    setSessionState((prev) => ({
      ...prev,
      selectedScriptId: scriptId,
      stage: "execution",
      currentBlockIndex: 0,
    }));
    showStageNotification("Выполнение скрипта");
  };

  const handlePreviousBlock = () => {
    setSessionState((prev) => ({
      ...prev,
      currentBlockIndex: Math.max(0, prev.currentBlockIndex - 1),
    }));
  };

  const handleNextBlock = () => {
    if (selectedScript && sessionState.currentBlockIndex < selectedScript.blocks.length - 1) {
      setSessionState((prev) => ({
        ...prev,
        currentBlockIndex: prev.currentBlockIndex + 1,
      }));
    }
  };

  const handleFinishSession = () => {
    setSessionState((prev) => ({
      ...prev,
      stage: "completion",
    }));
    showStageNotification("Завершение сеанса");
  };

  const handleCompleteSession = () => {
    setSessionState({
      stage: "intake",
      clientProblem: "",
      analysis: "",
      selectedScriptId: null,
      currentBlockIndex: 0,
    });
    setIntakeAnswers(["", "", "", ""]);
    setAnalysisAnswers(["", "", "", ""]);
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist((prev) => ({
      ...prev,
      [sessionState.stage]: prev[sessionState.stage].includes(itemId)
        ? prev[sessionState.stage].filter((i) => i !== itemId)
        : [...prev[sessionState.stage], itemId],
    }));
  };

  // ===== ЭТАП 1: НАЧАЛО СЕАНСА =====
  if (sessionState.stage === "intake") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <SessionRoadmap currentStage="intake" />
        
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Главная
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Сеанс</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">Начало сеанса</h1>
        <p className="text-muted-foreground mb-8">Ответьте на вопросы для понимания вашего запроса</p>

        <StageRecommendations stage="intake" />

        <div className="space-y-6 my-6">
          {INTAKE_QUESTIONS.map((question, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{i + 1}. {question}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ваш ответ..."
                  value={intakeAnswers[i]}
                  onChange={(e) => {
                    const newAnswers = [...intakeAnswers];
                    newAnswers[i] = e.target.value;
                    setIntakeAnswers(newAnswers);
                  }}
                  className="min-h-24"
                  data-testid={`intake-answer-${i}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <SessionChecklist stage="intake" checkedItems={checklist.intake} onToggle={toggleChecklistItem} />

        <div className="flex gap-4 mt-8 flex-wrap">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <Button 
            onClick={handleIntakeNext}
            disabled={!intakeAnswers[0].trim()}
            data-testid="button-intake-next"
          >
            Далее: Анализ запроса
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ===== ЭТАП 2: АНАЛИЗ ЗАПРОСА =====
  if (sessionState.stage === "analysis") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <SessionRoadmap currentStage="analysis" />

        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Этап 2 из 5
          </div>
          <h1 className="text-3xl font-bold mb-2">Уточнение запроса</h1>
          <p className="text-muted-foreground">Определим оптимальный подход к вашей ситуации</p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ваш основной запрос:</strong> {sessionState.clientProblem.slice(0, 100)}...
          </AlertDescription>
        </Alert>

        <StageRecommendations stage="analysis" />

        <div className="space-y-6 my-6">
          {ANALYSIS_QUESTIONS.map((question, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{i + 1}. {question}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ваш ответ..."
                  value={analysisAnswers[i]}
                  onChange={(e) => {
                    const newAnswers = [...analysisAnswers];
                    newAnswers[i] = e.target.value;
                    setAnalysisAnswers(newAnswers);
                  }}
                  className="min-h-20"
                  data-testid={`analysis-answer-${i}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <SessionChecklist stage="analysis" checkedItems={checklist.analysis} onToggle={toggleChecklistItem} />

        <div className="flex gap-4 mt-8 flex-wrap">
          <Button 
            variant="ghost"
            onClick={() => setSessionState((prev) => ({ ...prev, stage: "intake" }))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <Button 
            onClick={handleAnalysisNext}
            disabled={!analysisAnswers[0].trim()}
            data-testid="button-analysis-next"
          >
            Далее: Выбор скрипта
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <QuestionTemplates stage="analysis" />
        </div>
      </div>
    );
  }

  // ===== ЭТАП 3: ВЫБОР СКРИПТА =====
  if (sessionState.stage === "selection") {
    const recommendedScripts = getRecommendedScripts();

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <SessionRoadmap currentStage="selection" />

        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Этап 3 из 5
          </div>
          <h1 className="text-3xl font-bold mb-2">Выбор подходящего скрипта</h1>
          <p className="text-muted-foreground">На основе вашего запроса рекомендуем следующие скрипты</p>
        </div>

        <StageRecommendations stage="selection" />

        {recommendedScripts.length > 0 ? (
          <div className="space-y-4 mb-8 mt-6">
            {recommendedScripts.map((script) => (
              <Card 
                key={script.id}
                className="cursor-pointer hover-elevate transition-all"
                onClick={() => handleSelectScript(script.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{script.title}</CardTitle>
                  <CardDescription>{script.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {script.blocks.length} блоков • {script.difficulty === "beginner" ? "Начальный" : script.difficulty === "intermediate" ? "Средний" : "Продвинутый"} уровень
                  </div>
                  <Button size="sm" data-testid={`button-select-script-${script.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Начать
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Не найдено подходящих скриптов. Попробуйте уточнить анализ запроса.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3">Или выберите любой скрипт из списка:</p>
            <ScrollArea className="h-64 border rounded-md p-4">
              <div className="space-y-2">
                {scripts.map((script) => (
                  <Button
                    key={script.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleSelectScript(script.id)}
                    data-testid={`button-select-script-any-${script.id}`}
                  >
                    {script.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex gap-4 mt-8 flex-wrap">
          <Button 
            variant="ghost"
            onClick={() => setSessionState((prev) => ({ ...prev, stage: "analysis" }))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  // ===== ЭТАП 4: ВЫПОЛНЕНИЕ СКРИПТА =====
  if (sessionState.stage === "execution" && selectedScript) {
    const currentBlock = selectedScript.blocks[sessionState.currentBlockIndex];
    const progress = Math.round(((sessionState.currentBlockIndex + 1) / selectedScript.blocks.length) * 100);

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <SessionRoadmap currentStage="execution" />

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Этап 4 из 5
            </div>
            <div className="text-sm text-muted-foreground">
              {sessionState.currentBlockIndex + 1} из {selectedScript.blocks.length}
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{selectedScript.title}</h1>
          <p className="text-muted-foreground mb-4">{selectedScript.description}</p>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className={`text-lg ${
              currentBlock.type === "heading" ? "text-primary" : 
              currentBlock.type === "question" ? "text-blue-600" :
              currentBlock.type === "instruction" ? "text-green-600" :
              "text-muted-foreground"
            }`}>
              {currentBlock.type === "heading" && "📌"}
              {currentBlock.type === "question" && "❓"}
              {currentBlock.type === "instruction" && "📍"}
              {currentBlock.type === "note" && "📝"}
              {" "}
              {currentBlock.content}
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="flex gap-4 flex-wrap">
          <Button 
            variant="outline"
            onClick={handlePreviousBlock}
            disabled={sessionState.currentBlockIndex === 0}
            data-testid="button-previous-block"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>

          {sessionState.currentBlockIndex < selectedScript.blocks.length - 1 ? (
            <Button 
              onClick={handleNextBlock}
              data-testid="button-next-block"
            >
              Далее
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleFinishSession}
              className="bg-success hover:bg-success/90"
              data-testid="button-finish-session"
            >
              Завершить сеанс
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          <Button 
            variant="ghost"
            onClick={() => setSessionState((prev) => ({ ...prev, stage: "selection" }))}
            data-testid="button-back-to-selection"
          >
            Изменить скрипт
          </Button>
          <QuestionTemplates stage="execution" />
        </div>
      </div>
    );
  }

  // ===== ЭТАП 5: ЗАВЕРШЕНИЕ =====
  if (sessionState.stage === "completion") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <SessionRoadmap currentStage="completion" />

        <h1 className="text-3xl font-bold mb-2">Завершение сеанса</h1>
        <p className="text-muted-foreground mb-8">Протокол завершения терапевтической сеанса</p>

        <StageRecommendations stage="completion" />

        <SessionChecklist stage="completion" checkedItems={checklist.completion} onToggle={toggleChecklistItem} />

        <div className="flex gap-4 mt-8 flex-wrap">
          <Button 
            onClick={handleCompleteSession}
            className="bg-success hover:bg-success/90"
            data-testid="button-new-session"
          >
            Начать новый сеанс
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
