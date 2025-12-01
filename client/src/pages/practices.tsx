import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Practice } from "@shared/schema";

export default function Practices() {
  const { data: practices = [], isLoading } = useQuery<Practice[]>({
    queryKey: ["/api/practices"],
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" data-testid="breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-home">
          Главная
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Практики внедрения</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Практики внедрения
        </h1>
        <p className="text-muted-foreground">
          Техники для закрепления результатов терапии и интеграции новых паттернов поведения. 
          Выберите практику, подходящую для текущего этапа работы с клиентом.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {practices.map((practice) => (
          <Card key={practice.id} className="h-full" data-testid={`card-practice-${practice.id}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{practice.emoji}</span>
                <div>
                  <CardTitle className="text-base">{practice.title}</CardTitle>
                </div>
              </div>
              <CardDescription className="mt-2">{practice.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="steps" className="border-none">
                  <AccordionTrigger className="text-sm py-2 hover:no-underline" data-testid={`button-toggle-steps-${practice.id}`}>
                    Показать шаги ({practice.steps.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mt-2">
                      {practice.steps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link href="/">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
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
  );
}
