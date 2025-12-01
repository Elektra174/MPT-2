import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TIMER_KEY = "mpt-session-timer";

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
        return {
          ...state,
          seconds: state.seconds + elapsed,
          startedAt: Date.now(),
        };
      }
      return state;
    }
  } catch {
  }
  return { seconds: 0, running: false, startedAt: null };
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

  useEffect(() => {
    saveTimerState(state);
  }, [state]);

  useEffect(() => {
    if (!state.running) return;

    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        seconds: prev.seconds + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.running]);

  const toggleTimer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      running: !prev.running,
      startedAt: !prev.running ? Date.now() : null,
    }));
  }, []);

  const resetTimer = useCallback(() => {
    setState({
      seconds: 0,
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
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Время сессии</p>
            <p className="text-2xl font-mono font-semibold" data-testid="text-timer-display">
              {formatTime(state.seconds)}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              variant={state.running ? "secondary" : "default"}
              size="sm"
              onClick={toggleTimer}
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
              disabled={state.seconds === 0}
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
