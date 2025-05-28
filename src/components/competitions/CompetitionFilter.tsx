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

export interface CompetitionFilters {
  search: string;
  category: string;
  difficulty: string;
  prizeRange: string;
  sortBy: string;
  timeframe: string;
}

interface CompetitionFilterProps {
  onFilterChange: (filters: CompetitionFilters) => void;
  activeFiltersCount?: number;
}

export default function CompetitionFilter({
  onFilterChange = () => {},
  activeFiltersCount = 0,
}: Partial<CompetitionFilterProps>) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [prizeRange, setPrizeRange] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [timeframe, setTimeframe] = useState("all");

  const updateFilters = (newFilters: Partial<CompetitionFilters>) => {
    const filters = {
      search,
      category,
      difficulty,
      prizeRange,
      sortBy,
      timeframe,
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

  const handlePrizeRangeChange = (value: string) => {
    setPrizeRange(value);
    updateFilters({ prizeRange: value });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters({ sortBy: value });
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    updateFilters({ timeframe: value });
  };

  const clearAllFilters = () => {
    setSearch("");
    setCategory("all");
    setDifficulty("all");
    setPrizeRange("all");
    setSortBy("deadline");
    setTimeframe("all");
    updateFilters({
      search: "",
      category: "all",
      difficulty: "all",
      prizeRange: "all",
      sortBy: "deadline",
      timeframe: "all",
    });
  };

  const getActiveFilters = () => {
    const filters = [];
    if (category !== "all") filters.push({ key: "category", value: category });
    if (difficulty !== "all")
      filters.push({ key: "difficulty", value: difficulty });
    if (prizeRange !== "all") filters.push({ key: "prize", value: prizeRange });
    if (timeframe !== "all")
      filters.push({ key: "timeframe", value: timeframe });
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
          placeholder="Search competitions by title, description, or organizer..."
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
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Writing">Writing</SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
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
                <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
                <SelectItem value="prize">Prize (Highest)</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="participants">Most Popular</SelectItem>
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
                        Prize Range
                      </label>
                      <Select
                        value={prizeRange}
                        onValueChange={handlePrizeRangeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select prize range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Prize</SelectItem>
                          <SelectItem value="0-1000">$0 - $1,000</SelectItem>
                          <SelectItem value="1000-3000">
                            $1,000 - $3,000
                          </SelectItem>
                          <SelectItem value="3000-5000">
                            $3,000 - $5,000
                          </SelectItem>
                          <SelectItem value="5000+">$5,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Deadline
                      </label>
                      <Select
                        value={timeframe}
                        onValueChange={handleTimeframeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Time</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="quarter">Next 3 Months</SelectItem>
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
                  if (filter.key === "prize") handlePrizeRangeChange("all");
                  if (filter.key === "timeframe") handleTimeframeChange("all");
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
