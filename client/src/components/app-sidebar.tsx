import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { ChevronDown, ChevronRight, BookOpen, Sparkles, CheckSquare } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Category, TherapyScript } from "@shared/schema";

const STORAGE_KEY = "mpt-expanded-categories";

function loadExpandedCategories(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveExpandedCategories(categories: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
  }
}

export function AppSidebar() {
  const [location] = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(() => loadExpandedCategories());

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: scripts = [] } = useQuery<TherapyScript[]>({
    queryKey: ["/api/scripts"],
  });

  useEffect(() => {
    saveExpandedCategories(expandedCategories);
  }, [expandedCategories]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const getScriptsForCategory = (categoryId: string) => {
    return scripts.filter((s) => s.categoryId === categoryId).sort((a, b) => a.order - b.order);
  };

  const currentScriptId = location.startsWith("/script/") ? location.split("/script/")[1] : null;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/">
          <div className="flex items-center gap-3 hover-elevate rounded-md p-2 -m-2 cursor-pointer" data-testid="link-home">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-sidebar-foreground">МПТ Скрипты</span>
              <span className="text-xs text-sidebar-foreground/70">Мета-персональная терапия</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider px-4 py-2">
              Навигация
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {categories.map((category) => {
                  const categoryScripts = getScriptsForCategory(category.id);
                  const isExpanded = expandedCategories.includes(category.id);
                  const hasActiveScript = categoryScripts.some((s) => s.id === currentScriptId);

                  return (
                    <Collapsible
                      key={category.id}
                      open={isExpanded}
                      onOpenChange={() => toggleCategory(category.id)}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={`w-full justify-between hover-elevate ${hasActiveScript ? "bg-sidebar-accent" : ""}`}
                            data-testid={`button-category-${category.id}`}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="text-lg flex-shrink-0">{category.emoji}</span>
                              <span className="truncate text-sm">{category.title}</span>
                            </span>
                            <span className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 opacity-70" />
                              ) : (
                                <ChevronRight className="h-4 w-4 opacity-70" />
                              )}
                            </span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {categoryScripts.map((script) => (
                              <SidebarMenuSubItem key={script.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={script.id === currentScriptId}
                                >
                                  <Link
                                    href={`/script/${script.id}`}
                                    data-testid={`link-script-${script.id}`}
                                  >
                                    <span className="truncate">{script.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider px-4 py-2">
              Инструменты
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/practices"}
                    className="hover-elevate"
                  >
                    <Link href="/practices" data-testid="link-practices">
                      <Sparkles className="h-4 w-4" />
                      <span>Практики внедрения</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/session-complete"}
                    className="hover-elevate"
                  >
                    <Link href="/session-complete" data-testid="link-session-complete">
                      <CheckSquare className="h-4 w-4" />
                      <span>Завершение сессии</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="text-xs text-sidebar-foreground/50 text-center">
          Профессиональный инструмент для терапевтов
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
