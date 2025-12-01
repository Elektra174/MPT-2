import { useState, useEffect } from "react";
import { MessageSquare, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TherapistNote } from "@shared/schema";

const NOTES_KEY = "mpt-therapist-notes";

interface NotesModalProps {
  scriptId: string;
  scriptTitle: string;
}

function loadNotes(): TherapistNote[] {
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: TherapistNote[]) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
  }
}

export function NotesModal({ scriptId, scriptTitle }: NotesModalProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<TherapistNote[]>([]);

  useEffect(() => {
    const allNotes = loadNotes();
    setNotes(allNotes);
    const existingNote = allNotes.find((n) => n.scriptId === scriptId);
    setContent(existingNote?.content || "");
  }, [scriptId, open]);

  const handleSave = () => {
    const allNotes = loadNotes();
    const existingIndex = allNotes.findIndex((n) => n.scriptId === scriptId);
    const now = Date.now();

    const note: TherapistNote = {
      id: existingIndex !== -1 ? allNotes[existingIndex].id : `note-${Date.now()}`,
      scriptId,
      scriptTitle,
      content,
      createdAt: existingIndex !== -1 ? allNotes[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex !== -1) {
      allNotes[existingIndex] = note;
    } else {
      allNotes.push(note);
    }

    saveNotes(allNotes);
    setNotes(allNotes);
    setOpen(false);
  };

  const handleDelete = () => {
    const allNotes = loadNotes().filter((n) => n.scriptId !== scriptId);
    saveNotes(allNotes);
    setNotes(allNotes);
    setContent("");
    setOpen(false);
  };

  const hasNote = notes.some((n) => n.scriptId === scriptId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasNote ? "default" : "outline"}
          size="sm"
          className={hasNote ? "bg-primary" : ""}
          data-testid={`button-notes-${scriptId}`}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" data-testid={`dialog-notes-${scriptId}`}>
        <DialogHeader>
          <DialogTitle>Заметки: {scriptTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Введите заметки для этого скрипта..."
            className="min-h-[300px]"
            data-testid={`textarea-notes-${scriptId}`}
          />
          <div className="flex gap-2 justify-end">
            {hasNote && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                data-testid={`button-delete-note-${scriptId}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-notes"
            >
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
            <Button onClick={handleSave} data-testid={`button-save-note-${scriptId}`}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getNotes(): TherapistNote[] {
  return loadNotes();
}
