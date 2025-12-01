import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const TIMER_KEY = "mpt-session-timer";
const SESSION_DURATION = 3600; // 60 minutes in seconds
const REMINDER_TIME = 600; // 10 minutes in seconds

interface TimerState {
  seconds: number;
  running: boolean;
  startedAt: number | null;
}

function loadTimerState(): TimerState {
  try {
    const stored = localStorage.getItem(TIMER_KEY);
    if (stored) {
      const state = JSON.parse(stored) as TimerState;
      if (state.running && state.startedAt) {
        const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
        const newSeconds = Math.max(0, state.seconds - elapsed);
        return {
          ...state,
          seconds: newSeconds,
          startedAt: Date.now(),
        };
      }
      return state;
    }
  } catch {
  }
  return { seconds: SESSION_DURATION, running: false, startedAt: null };
}

function saveTimerState(state: TimerState) {
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify(state));
  } catch {
  }
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function SessionTimer() {
  const [state, setState] = useState<TimerState>(() => loadTimerState());
  const reminderShownRef = useRef(false);
  const finishShownRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    saveTimerState(state);
  }, [state]);

  useEffect(() => {
    if (!state.running) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const newSeconds = Math.max(0, prev.seconds - 1);
        
        // Show reminder at 10 minutes remaining
        if (newSeconds === REMINDER_TIME && !reminderShownRef.current) {
          reminderShownRef.current = true;
          toast({
            title: "⏰ До конца сеанса осталось 10 минут",
            description: "Завершите активный скрипт.",
            duration: 5000,
          });
        }
        
        // Show reminder when time is up
        if (newSeconds === 0 && !finishShownRef.current) {
          finishShownRef.current = true;
          toast({
            title: "⏱️ Время сеанса вышло",
            description: "Сеанс завершен. Переходите к протоколу завершения.",
            duration: 10000,
          });
        }
        
        return {
          ...prev,
          seconds: newSeconds,
          running: newSeconds > 0 ? prev.running : false,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.running, toast]);

  const toggleTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      running: !prev.running,
      startedAt: !prev.running ? Date.now() : null,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    reminderShownRef.current = false;
    finishShownRef.current = false;
    setState({
      seconds: SESSION_DURATION,
      running: false,
      startedAt: null,
    });
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`gap-2 min-w-[90px] font-mono ${state.running ? "text-primary" : ""}`}
          data-testid="button-timer"
        >
          <Clock className="h-4 w-4" />
          <span>{formatTime(state.seconds)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-3">
          {state.seconds <= REMINDER_TIME && state.seconds > 0 && state.running && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-xs font-medium text-destructive">⏰ {formatTime(state.seconds)} осталось</p>
            </div>
          )}
          {state.seconds === 0 && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-xs font-medium text-destructive">Время вышло!</p>
            </div>
          )}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Осталось времени</p>
            <p className={`text-2xl font-mono font-semibold ${state.seconds <= REMINDER_TIME && state.seconds > 0 ? 'text-destructive' : state.seconds === 0 ? 'text-destructive' : ''}`} data-testid="text-timer-display">
              {formatTime(state.seconds)}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              variant={state.running ? "secondary" : "default"}
              size="sm"
              onClick={toggleTimer}
              disabled={state.seconds === 0}
              data-testid="button-timer-toggle"
            >
              {state.running ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Пауза
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Старт
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetTimer}
              disabled={state.seconds === SESSION_DURATION}
              data-testid="button-timer-reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
