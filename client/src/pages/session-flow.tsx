import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, ChevronRight, Play, AlertCircle, Bell, Save, Download } from "lucide-react";
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

type SessionStage = "greeting" | "intake" | "formulation" | "analysis" | "selection" | "execution" | "completion";

interface SessionState {
  stage: SessionStage;
  clientName: string;
  clientProblem: string;
  requestFormulation: string;
  requestCriteria: Record<string, string>;
  analysis: string;
  selectedScriptId: string | null;
  currentBlockIndex: number;
  sessionNotes: string;
  sessionResults: string;
  sessionDate: string;
}

interface ChecklistState {
  [key: string]: string[];
}

// ВОПРОСЫ ПРИВЕТСТВИЯ И УСТАНОВЛЕНИЯ РАППОРТА
const GREETING_TIPS = [
  "Создайте безопасную атмосферу - улыбка, открытая поза, спокойный голос",
  "Поздоровайтесь тепло и профессионально",
  "Убедитесь, что клиенту комфортно",
  "Получите согласие на запись и конфиденциальность",
  "Объясните структуру первой сеанса",
];

const INTAKE_QUESTIONS = [
  "Какая проблема или ситуация привела тебя на сеанс?",
  "Как долго ты испытываешь эту проблему?",
  "Что ты уже пробовал делать для её решения?",
  "Какой идеальный результат ты хочешь получить?",
];

// ВОПРОСЫ ФОРМУЛИРОВАНИЯ КОРРЕКТНОГО ЗАПРОСА
const FORMULATION_QUESTIONS = [
  {
    label: "Позитивная формулировка",
    hint: "Сформулируй свой запрос в позитиве - что ты ХОЧЕШЬ получить, а не от чего избавиться?",
  },
  {
    label: "Мотивирующий запрос",
    hint: "Насколько для тебя важно это изменение? Оцени от 1 до 10 баллов.",
  },
  {
    label: "Зависящий от клиента",
    hint: "Зависит ли этот результат от тебя? Или ты ждёшь изменений от других?",
  },
  {
    label: "Реалистичный",
    hint: "Реален ли этот результат? Можно ли его достичь за разумное время?",
  },
  {
    label: "Конкретный",
    hint: "По каким признакам ты поймёшь, что это произошло? Какие конкретные изменения?",
  },
];

const ANALYSIS_QUESTIONS = [
  "Это больше связано со страхами, убеждениями или стратегиями?",
  "Есть ли здесь блокировка на уровне тела или эмоций?",
  "Нужна ли работа с идентичностью или это работа с конкретной ситуацией?",
  "Какую поддержку ты ищешь в первую очередь?",
];

const THERAPIST_TIPS = {
  greeting: GREETING_TIPS,
  intake: [
    "✓ Слушайте внимательно - запишите ключевые слова и эмоции клиента",
    "✓ Не давайте советы на этом этапе - только собирайте информацию",
    "✓ Отмечайте, какие вопросы вызвали наибольшую эмоциональную реакцию",
    "✓ Уточняйте - просите примеры вместо обобщений",
    "✓ Определите актуальность проблемы (по шкале от 1 до 10)",
  ],
  formulation: [
    "✓ Проверьте запрос по всем пяти критериям",
    "✓ Уточняйте и переформулируйте с клиентом",
    "✓ Мотивация должна быть минимум 8 баллов",
    "✓ Запрос должен быть зависящий от клиента, а не от других",
    "✓ После согласования - возникает терапевтический альянс",
  ],
  analysis: [
    "✓ Анализируйте на трёх уровнях: стратегии, убеждения, идентичность",
    "✓ Определите, где находится основная блокировка",
    "✓ Выявите связь с телесными ощущениями",
    "✓ Предположите базовую потребность, которая не удовлетворяется",
    "✓ Запишите гипотезу - какой скрипт может помочь",
  ],
  execution: [
    "✓ Следуйте скрипту, не пропуская шаги",
    "✓ Наблюдайте за телесными реакциями клиента (дыхание, осанка, голос)",
    "✓ Замечайте сдвиги в состоянии и энергии",
    "✓ При необходимости замедляйте или повторяйте шаги",
    "✓ Сохраняйте паузы после сильных переживаний",
  ],
  completion: [
    "✓ Спросите - что изменилось в состоянии и восприятии?",
    "✓ Убедитесь, что клиент интегрировал опыт",
    "✓ Дайте домашнее задание для закрепления результата",
    "✓ Назначьте дату следующей сеанса",
    "✓ Документируйте результаты для отслеживания прогресса",
  ],
};

export default function SessionFlow() {
  const { toast } = useToast();
  const [sessionState, setSessionState] = useState<SessionState>({
    stage: "greeting",
    clientName: "",
    clientProblem: "",
    requestFormulation: "",
    requestCriteria: {
      positive: "",
      motivation: "",
      dependence: "",
      realistic: "",
      concrete: "",
    },
    analysis: "",
    selectedScriptId: null,
    currentBlockIndex: 0,
    sessionNotes: "",
    sessionResults: "",
    sessionDate: new Date().toLocaleDateString("ru-RU"),
  });

  const [intakeAnswers, setIntakeAnswers] = useState<string[]>(["", "", "", ""]);
  const [analysisAnswers, setAnalysisAnswers] = useState<string[]>(["", "", "", ""]);
  const [checklist, setChecklist] = useState<ChecklistState>({
    greeting: [],
    intake: [],
    formulation: [],
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

  const saveSession = () => {
    const sessionData = {
      ...sessionState,
      intakeAnswers,
      analysisAnswers,
      checklist,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("mpt-current-session", JSON.stringify(sessionData));
    toast({
      title: "Сеанс сохранён",
      description: "Данные сеанса сохранены в браузере",
      duration: 2000,
    });
  };

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
    const formulation = sessionState.requestFormulation.toLowerCase();
    
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

  const handleGreetingNext = () => {
    if (!sessionState.clientName.trim()) {
      toast({
        title: "Введите имя клиента",
        description: "Это поможет персонализировать сеанс",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    setSessionState((prev) => ({
      ...prev,
      stage: "intake",
    }));
    showStageNotification("Сбор информации о запросе");
  };

  const handleIntakeNext = () => {
    const problem = intakeAnswers.filter((a) => a.trim()).join(" ");
    setSessionState((prev) => ({
      ...prev,
      stage: "formulation",
      clientProblem: problem,
    }));
    showStageNotification("Формулирование корректного запроса");
  };

  const handleFormulationNext = () => {
    if (!sessionState.requestFormulation.trim()) {
      toast({
        title: "Сформулируйте запрос",
        description: "Напишите основную формулировку запроса клиента",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    setSessionState((prev) => ({
      ...prev,
      stage: "analysis",
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

  const exportSessionReport = () => {
    const report = `
МПТ СЕАНС - ОТЧЁТ
═════════════════════════════════════════
Клиент: ${sessionState.clientName}
Дата сеанса: ${sessionState.sessionDate}

ЗАПРОС:
${sessionState.requestFormulation}

АНАЛИЗ:
${sessionState.analysis}

ИСПОЛЬЗОВАННЫЙ СКРИПТ:
${selectedScript?.title || "Не выбран"}

ЗАМЕТКИ ТЕРАПЕВТА:
${sessionState.sessionNotes}

РЕЗУЛЬТАТЫ СЕАНСА:
${sessionState.sessionResults}

═════════════════════════════════════════
Сгенерировано: ${new Date().toLocaleString("ru-RU")}
    `;
    
    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MPT-session-${sessionState.clientName}-${sessionState.sessionDate}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Отчёт скачан",
      description: "Файл с отчётом о сеансе сохранён",
      duration: 2000,
    });
  };

  const handleCompleteSession = () => {
    localStorage.removeItem("mpt-current-session");
    setSessionState({
      stage: "greeting",
      clientName: "",
      clientProblem: "",
      requestFormulation: "",
      requestCriteria: {
        positive: "",
        motivation: "",
        dependence: "",
        realistic: "",
        concrete: "",
      },
      analysis: "",
      selectedScriptId: null,
      currentBlockIndex: 0,
      sessionNotes: "",
      sessionResults: "",
      sessionDate: new Date().toLocaleDateString("ru-RU"),
    });
    setIntakeAnswers(["", "", "", ""]);
    setAnalysisAnswers(["", "", "", ""]);
    setChecklist({
      greeting: [],
      intake: [],
      formulation: [],
      analysis: [],
      selection: [],
      execution: [],
      completion: [],
    });
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist((prev) => ({
      ...prev,
      [sessionState.stage]: prev[sessionState.stage].includes(itemId)
        ? prev[sessionState.stage].filter((i) => i !== itemId)
        : [...prev[sessionState.stage], itemId],
    }));
  };

  // ===== ЭТАП 0: ПРИВЕТСТВИЕ =====
  if (sessionState.stage === "greeting") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Подготовка сеанса
          </div>
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать!</h1>
          <p className="text-muted-foreground mb-8">Давайте начнём с установления контакта и понимания вашего запроса</p>
        </div>

        <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base flex items-start gap-2">
              <Bell className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Рекомендации при приветствии</p>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  {THERAPIST_TIPS.greeting.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Информация о клиенте</CardTitle>
            <CardDescription>Заполните базовую информацию для начала сеанса</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Имя клиента</label>
              <input
                type="text"
                placeholder="Введите имя клиента"
                value={sessionState.clientName}
                onChange={(e) =>
                  setSessionState((prev) => ({
                    ...prev,
                    clientName: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                data-testid="input-client-name"
              />
            </div>
          </CardContent>
        </Card>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Структура сеанса:</strong> Приветствие → Запрос → Формулирование → Анализ → Выбор скрипта → Выполнение → Завершение
          </AlertDescription>
        </Alert>

        <SessionChecklist stage="greeting" checkedItems={checklist.greeting} onToggle={toggleChecklistItem} />

        <div className="flex gap-4 mt-8 flex-wrap">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </Link>
          <Button 
            onClick={handleGreetingNext}
            data-testid="button-greeting-next"
          >
            Начать сеанс
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // ===== ЭТАП 1: СБОР ИНФОРМАЦИИ =====
  if (sessionState.stage === "intake") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Этап 1 из 6
          </div>
          <h1 className="text-3xl font-bold mb-2">Сбор информации</h1>
          <p className="text-muted-foreground mb-8">Расскажите о вашем запросе</p>
        </div>

        <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base flex items-start gap-2">
              <Bell className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Рекомендации для терапевта</p>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  {THERAPIST_TIPS.intake.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

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
          <Button 
            variant="ghost"
            onClick={() => setSessionState((prev) => ({ ...prev, stage: "greeting" }))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <Button 
            onClick={handleIntakeNext}
            disabled={!intakeAnswers[0].trim()}
            data-testid="button-intake-next"
          >
            Далее: Формулирование запроса
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <Button 
            variant="outline"
            onClick={saveSession}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>
    );
  }

  // ===== ЭТАП 2: ФОРМУЛИРОВАНИЕ ЗАПРОСА =====
  if (sessionState.stage === "formulation") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Этап 2 из 6
          </div>
          <h1 className="text-3xl font-bold mb-2">Формулирование корректного запроса</h1>
          <p className="text-muted-foreground mb-8">Проверим запрос по пяти ключевым критериям</p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Основная информация:</strong> {sessionState.clientProblem.slice(0, 100)}...
          </AlertDescription>
        </Alert>

        <Card className="mb-6 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-base flex items-start gap-2">
              <Bell className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Рекомендации для терапевта</p>
                <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                  {THERAPIST_TIPS.formulation.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Основная формулировка запроса</CardTitle>
            <CardDescription>Как звучит основной запрос клиента?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Сформулируйте основной запрос клиента..."
              value={sessionState.requestFormulation}
              onChange={(e) =>
                setSessionState((prev) => ({
                  ...prev,
                  requestFormulation: e.target.value,
                }))
              }
              className="min-h-24"
              data-testid="input-request-formulation"
            />
          </CardContent>
        </Card>

        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Критерии корректного запроса:</h3>
          {FORMULATION_QUESTIONS.map((q, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{i + 1}. {q.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{q.hint}</p>
                <Textarea
                  placeholder="Заметки..."
                  value={sessionState.requestCriteria[Object.keys(sessionState.requestCriteria)[i]] || ""}
                  onChange={(e) =>
                    setSessionState((prev) => ({
                      ...prev,
                      requestCriteria: {
                        ...prev.requestCriteria,
                        [Object.keys(prev.requestCriteria)[i]]: e.target.value,
                      },
                    }))
                  }
                  className="min-h-16"
                  data-testid={`criteria-${i}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-base text-amber-900 dark:text-amber-100">Заметки терапевта</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ваши наблюдения о запросе и клиенте..."
              value={sessionState.sessionNotes}
              onChange={(e) =>
                setSessionState((prev) => ({
                  ...prev,
                  sessionNotes: e.target.value,
                }))
              }
              className="min-h-20"
              data-testid="formulation-notes"
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-8 flex-wrap">
          <Button 
            variant="ghost"
            onClick={() => setSessionState((prev) => ({ ...prev, stage: "intake" }))}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <Button 
            onClick={handleFormulationNext}
            data-testid="button-formulation-next"
          >
            Далее: Анализ
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <Button 
            variant="outline"
            onClick={saveSession}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>
    );
  }

  // ===== ЭТАП 3: АНАЛИЗ =====
  if (sessionState.stage === "analysis") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Этап 3 из 6
          </div>
          <h1 className="text-3xl font-bold mb-2">Анализ запроса</h1>
          <p className="text-muted-foreground">Определим подходящий метод работы</p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Запрос клиента:</strong> {sessionState.requestFormulation}
          </AlertDescription>
        </Alert>

        <Card className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-base flex items-start gap-2">
              <Bell className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100 mb-2">Рекомендации для терапевта</p>
                <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                  {THERAPIST_TIPS.analysis.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="space-y-6 my-6">
          {ANALYSIS_QUESTIONS.map((question, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{i + 1}. {question}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ваш анализ..."
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
            onClick={() => setSessionState((prev) => ({ ...prev, stage: "formulation" }))}
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
          <Button 
            variant="outline"
            onClick={saveSession}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
          <QuestionTemplates stage="analysis" />
        </div>
      </div>
    );
  }

  // ===== ЭТАП 4: ВЫБОР СКРИПТА =====
  if (sessionState.stage === "selection") {
    const recommendedScripts = getRecommendedScripts();

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Этап 4 из 6
          </div>
          <h1 className="text-3xl font-bold mb-2">Выбор подходящего скрипта</h1>
          <p className="text-muted-foreground">На основе анализа рекомендуем следующие скрипты</p>
        </div>

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
              Не найдено подходящих скриптов. Попробуйте уточнить анализ.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3">Или выберите любой скрипт из полного списка:</p>
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
          <Button 
            variant="outline"
            onClick={saveSession}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>
    );
  }

  // ===== ЭТАП 5: ВЫПОЛНЕНИЕ СКРИПТА =====
  if (sessionState.stage === "execution" && selectedScript) {
    const currentBlock = selectedScript.blocks[sessionState.currentBlockIndex];
    const progress = Math.round(((sessionState.currentBlockIndex + 1) / selectedScript.blocks.length) * 100);

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Этап 5 из 6
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
              currentBlock.type === "question" ? "text-blue-600 dark:text-blue-400" :
              currentBlock.type === "instruction" ? "text-green-600 dark:text-green-400" :
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

        <Card className="mb-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-base text-amber-900 dark:text-amber-100">Наблюдения о клиенте</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Записывайте изменения в состоянии, телесные реакции, высказывания клиента..."
              value={sessionState.sessionNotes}
              onChange={(e) =>
                setSessionState((prev) => ({
                  ...prev,
                  sessionNotes: e.target.value,
                }))
              }
              className="min-h-20"
              data-testid="execution-notes"
            />
          </CardContent>
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
          <Button 
            variant="outline"
            onClick={saveSession}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
          <QuestionTemplates stage="execution" />
        </div>
      </div>
    );
  }

  // ===== ЭТАП 6: ЗАВЕРШЕНИЕ =====
  if (sessionState.stage === "completion") {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Этап 6 из 6
          </div>
          <h1 className="text-3xl font-bold mb-2">Завершение сеанса</h1>
          <p className="text-muted-foreground mb-8">Протокол завершения терапевтической сеанса</p>
        </div>

        <Card className="mb-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-base flex items-start gap-2">
              <Bell className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100 mb-2">Рекомендации по завершению</p>
                <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                  {THERAPIST_TIPS.completion.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Результаты сеанса</CardTitle>
            <CardDescription>Опишите, какие изменения произошли в состоянии и восприятии клиента</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Напишите результаты: что изменилось, какие инсайты получил клиент, какое его состояние в конце сеанса, рекомендации для продолжения работы..."
              value={sessionState.sessionResults}
              onChange={(e) =>
                setSessionState((prev) => ({
                  ...prev,
                  sessionResults: e.target.value,
                }))
              }
              className="min-h-32"
              data-testid="session-results"
            />
          </CardContent>
        </Card>

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
          <Button 
            variant="outline"
            onClick={exportSessionReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Скачать отчёт
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
