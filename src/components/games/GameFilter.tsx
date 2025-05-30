import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export interface GameFilters {
  search: string;
  category: string;
  difficulty: string;
  playerCount: string;
  gameType: string;
  sortBy: string;
  duration: string;
}

interface GameFilterProps {
  onFilterChange: (filters: GameFilters) => void;
  activeFiltersCount?: number;
}

export default function GameFilter({
  onFilterChange = () => {},
  activeFiltersCount = 0,
}: Partial<GameFilterProps>) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [playerCount, setPlayerCount] = useState("all");
  const [gameType, setGameType] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [duration, setDuration] = useState("all");

  const updateFilters = (newFilters: Partial<GameFilters>) => {
    const filters = {
      search,
      category,
      difficulty,
      playerCount,
      gameType,
      sortBy,
      duration,
      ...newFilters,
    };
    onFilterChange(filters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    updateFilters({ search: value });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateFilters({ category: value });
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value);
    updateFilters({ difficulty: value });
  };

  const handlePlayerCountChange = (value: string) => {
    setPlayerCount(value);
    updateFilters({ playerCount: value });
  };

  const handleGameTypeChange = (value: string) => {
    setGameType(value);
    updateFilters({ gameType: value });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters({ sortBy: value });
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    updateFilters({ duration: value });
  };

  const clearAllFilters = () => {
    setSearch("");
    setCategory("all");
    setDifficulty("all");
    setPlayerCount("all");
    setGameType("all");
    setSortBy("title");
    setDuration("all");
    updateFilters({
      search: "",
      category: "all",
      difficulty: "all",
      playerCount: "all",
      gameType: "all",
      sortBy: "title",
      duration: "all",
    });
  };

  const getActiveFilters = () => {
    const filters = [];
    if (category !== "all") filters.push({ key: "category", value: category });
    if (difficulty !== "all")
      filters.push({ key: "difficulty", value: difficulty });
    if (playerCount !== "all")
      filters.push({ key: "players", value: playerCount });
    if (gameType !== "all") filters.push({ key: "type", value: gameType });
    if (duration !== "all") filters.push({ key: "duration", value: duration });
    return filters;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="w-full mb-8 space-y-4">
      {/* Search Bar */}
      <div className="neumorphic-input-container relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search games by title, description, or organizer..."
          value={search}
          onChange={handleSearchChange}
          className="pl-10 h-12 bg-white border-none rounded-xl neumorphic-input"
        />
      </div>

      {/* Quick Filters and Advanced Filter Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Quick Category Filter */}
          <div className="neumorphic-select-container">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-10 bg-white border-none rounded-xl neumorphic-select min-w-[120px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Strategy">Strategy</SelectItem>
                <SelectItem value="Puzzle">Puzzle</SelectItem>
                <SelectItem value="Card">Card Games</SelectItem>
                <SelectItem value="Board">Board Games</SelectItem>
                <SelectItem value="Word">Word Games</SelectItem>
                <SelectItem value="Math">Math Games</SelectItem>
                <SelectItem value="Logic">Logic Games</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="neumorphic-select-container">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="h-10 bg-white border-none rounded-xl neumorphic-select min-w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="players">Player Count</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex items-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                className="neumorphic-button border-none relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                {activeFilters.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Advanced Filters</DrawerTitle>
                <DrawerDescription>
                  Refine your search with detailed filtering options
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Difficulty Level
                      </label>
                      <Select
                        value={difficulty}
                        onValueChange={handleDifficultyChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Player Count
                      </label>
                      <Select
                        value={playerCount}
                        onValueChange={handlePlayerCountChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select player count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Number</SelectItem>
                          <SelectItem value="1">Single Player</SelectItem>
                          <SelectItem value="2">2 Players</SelectItem>
                          <SelectItem value="3-4">3-4 Players</SelectItem>
                          <SelectItem value="5+">5+ Players</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Game Type
                      </label>
                      <Select
                        value={gameType}
                        onValueChange={handleGameTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select game type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="skill">Skill-based</SelectItem>
                          <SelectItem value="strategy">Strategy</SelectItem>
                          <SelectItem value="puzzle">Puzzle</SelectItem>
                          <SelectItem value="educational">
                            Educational
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Duration
                      </label>
                      <Select
                        value={duration}
                        onValueChange={handleDurationChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Duration</SelectItem>
                          <SelectItem value="quick">
                            Quick (Under 15 min)
                          </SelectItem>
                          <SelectItem value="short">
                            Short (15-30 min)
                          </SelectItem>
                          <SelectItem value="medium">
                            Medium (30-60 min)
                          </SelectItem>
                          <SelectItem value="long">Long (1+ hours)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <DrawerFooter>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <DrawerClose asChild>
                    <Button className="flex-1">Apply Filters</Button>
                  </DrawerClose>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span className="capitalize">
                {filter.key}: {filter.value}
              </span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={() => {
                  if (filter.key === "category") handleCategoryChange("all");
                  if (filter.key === "difficulty")
                    handleDifficultyChange("all");
                  if (filter.key === "players") handlePlayerCountChange("all");
                  if (filter.key === "type") handleGameTypeChange("all");
                  if (filter.key === "duration") handleDurationChange("all");
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
