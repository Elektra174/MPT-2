import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, BookOpen, Sparkles, CheckSquare } from "lucide-react";
import { useState, useMemo } from "react";
import { SearchBar } from "@/components/search-bar";
import { FilterBar } from "@/components/filter-bar";
import { FavoritesButton, getFavorites } from "@/components/favorites-button";
import { NotesModal } from "@/components/notes-modal";
import type { Category, TherapyScript, DifficultyLevel } from "@shared/schema";

export default function Home() {
  const [searchResults, setSearchResults] = useState<TherapyScript[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: scripts = [], isLoading: loadingScripts } = useQuery<TherapyScript[]>({
    queryKey: ["/api/scripts"],
  });

  const filteredScripts = useMemo(() => {
    let result = searchResults.length > 0 ? searchResults : scripts;

    if (selectedCategory) {
      result = result.filter((s) => s.categoryId === selectedCategory);
    }

    if (selectedDifficulty) {
      result = result.filter((s) => s.difficulty === selectedDifficulty);
    }

    if (showFavoritesOnly) {
      const favorites = getFavorites();
      result = result.filter((s) => favorites.includes(s.id));
    }

    return result;
  }, [searchResults, scripts, selectedCategory, selectedDifficulty, showFavoritesOnly]);

  const getScriptCountForCategory = (categoryId: string) => {
    return scripts.filter((s) => s.categoryId === categoryId).length;
  };

  const isLoading = loadingCategories || loadingScripts;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Библиотека скриптов МПТ
        </h1>
        <p className="text-muted-foreground">
          Профессиональный справочник для терапевтов мета-персональной терапии. Выберите категорию или скрипт для начала работы.
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/practices">
            <Card className="hover-elevate cursor-pointer transition-all h-full" data-testid="card-practices">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Практики внедрения</CardTitle>
                  <CardDescription className="text-sm">
                    Техники для закрепления результатов терапии
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>

          <Link href="/session-complete">
            <Card className="hover-elevate cursor-pointer transition-all h-full" data-testid="card-session-complete">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-success text-success-foreground">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Завершение сессии</CardTitle>
                  <CardDescription className="text-sm">
                    Протокол завершения терапевтической сессии
                  </CardDescription>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      <SearchBar scripts={scripts} onSearch={setSearchResults} />
      
      <FilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        selectedDifficulty={selectedDifficulty}
        onCategoryChange={setSelectedCategory}
        onDifficultyChange={setSelectedDifficulty}
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        <Badge
          variant={showFavoritesOnly ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          data-testid="badge-favorites-toggle"
        >
          Избранное ({getFavorites().length})
        </Badge>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4" data-testid="text-categories-heading">
        {showFavoritesOnly ? "Избранные скрипты" : filteredScripts.length > 0 ? "Результаты поиска" : "Скрипты"}
      </h2>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-6 mb-2" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredScripts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredScripts.map((script) => {
            const category = categories.find((c) => c.id === script.categoryId);
            return (
              <Card key={script.id} className="hover-elevate transition-all flex flex-col" data-testid={`card-script-${script.id}`}>
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <Link href={`/script/${script.id}`}>
                        <CardTitle className="text-base hover:text-primary transition-colors">{script.title}</CardTitle>
                      </Link>
                    </div>
                    <div className="flex-shrink-0">
                      <FavoritesButton scriptId={script.id} />
                    </div>
                  </div>
                  <CardDescription className="text-sm">{script.description}</CardDescription>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {category && (
                      <Badge variant="secondary" className="text-xs">
                        {category.emoji} {category.title}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="text-xs"
                      data-testid={`badge-difficulty-${script.difficulty}`}
                    >
                      {script.difficulty === "beginner"
                        ? "Базовый"
                        : script.difficulty === "intermediate"
                          ? "Средний"
                          : "Продвинутый"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Link href={`/script/${script.id}`} className="flex-1">
                      <div className="text-sm text-primary hover:underline">Открыть скрипт →</div>
                    </Link>
                    <NotesModal scriptId={script.id} scriptTitle={script.title} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Скрипты не найдены</p>
        </div>
      )}

      {!showFavoritesOnly && !selectedCategory && !selectedDifficulty && searchResults.length === 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Категории скриптов</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const scriptCount = getScriptCountForCategory(category.id);
              const categoryScripts = scripts
                .filter((s) => s.categoryId === category.id)
                .sort((a, b) => a.order - b.order);

              return (
                <Card key={category.id} className="hover-elevate transition-all" data-testid={`card-category-${category.id}`}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{category.emoji}</span>
                      <div className="flex-1">
                        <CardTitle className="text-base">{category.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {scriptCount}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-1">
                      {categoryScripts.slice(0, 3).map((script) => (
                        <Link key={script.id} href={`/script/${script.id}`}>
                          <div 
                            className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer text-sm"
                            data-testid={`link-script-preview-${script.id}`}
                          >
                            <BookOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate text-foreground">{script.title}</span>
                          </div>
                        </Link>
                      ))}
                      {categoryScripts.length > 3 && (
                        <span className="text-xs text-muted-foreground pl-5 mt-1">
                          +{categoryScripts.length - 3} ещё
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Всего скриптов: {scripts.length} | Найдено: {filteredScripts.length}</p>
      </div>
    </div>
  );
}
