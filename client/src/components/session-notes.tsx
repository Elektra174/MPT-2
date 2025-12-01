import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Note {
  id: string;
  text: string;
  timestamp: number;
}

const NOTES_KEY = "mpt-session-notes";

function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {}
}

export function SessionNotes() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [newNote, setNewNote] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      text: newNote,
      timestamp: Date.now(),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setNewNote("");
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-session-notes">
          <MessageSquare className="h-4 w-4" />
          Быстрые заметки ({notes.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl" data-testid="dialog-session-notes">
        <DialogHeader>
          <DialogTitle>Быстрые заметки сеанса</DialogTitle>
          <DialogDescription>
            Записывайте ключевые высказывания и наблюдения клиента
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            placeholder="Введите ключевое высказывание или наблюдение..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-20"
            data-testid="textarea-new-note"
          />
          <Button
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="w-full"
            data-testid="button-add-note"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Сохранить заметку
          </Button>
        </div>

        {notes.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">История заметок</p>
            <ScrollArea className="h-64 border rounded-md p-3">
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-2 bg-muted rounded text-sm flex justify-between items-start gap-2"
                    data-testid={`note-${note.id}`}
                  >
                    <p className="text-foreground flex-1">{note.text}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex-shrink-0 h-6 w-6"
                      data-testid={`button-delete-note-${note.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
