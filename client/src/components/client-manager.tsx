import { Users, Plus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

interface ClientProfile {
  id: string;
  name: string;
  createdAt: number;
  sessions: Array<{
    date: number;
    script: string;
    notes: string;
  }>;
}

const CLIENTS_KEY = "mpt-clients";

function loadClients(): ClientProfile[] {
  try {
    const stored = localStorage.getItem(CLIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveClients(clients: ClientProfile[]) {
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  } catch {}
}

export function ClientManager() {
  const [clients, setClients] = useState<ClientProfile[]>(() => loadClients());
  const [newClientName, setNewClientName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddClient = () => {
    if (!newClientName.trim()) return;
    const client: ClientProfile = {
      id: Date.now().toString(),
      name: newClientName,
      createdAt: Date.now(),
      sessions: [],
    };
    const updated = [client, ...clients];
    setClients(updated);
    saveClients(updated);
    setNewClientName("");
  };

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    saveClients(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-client-manager">
          <Users className="h-4 w-4" />
          Клиенты ({clients.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl" data-testid="dialog-client-manager">
        <DialogHeader>
          <DialogTitle>Управление клиентами</DialogTitle>
          <DialogDescription>
            Сохраняйте профили клиентов и историю их сеансов
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Имя клиента..."
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddClient()}
              data-testid="input-client-name"
            />
            <Button
              onClick={handleAddClient}
              disabled={!newClientName.trim()}
              size="sm"
              data-testid="button-add-client"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {clients.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Список клиентов</p>
              <ScrollArea className="h-64 border rounded-md p-3">
                <div className="space-y-2">
                  {clients.map((client) => (
                    <Card key={client.id} data-testid={`client-card-${client.id}`}>
                      <CardContent className="pt-4 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {client.sessions.length} сеансов
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                          data-testid={`button-delete-client-${client.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
