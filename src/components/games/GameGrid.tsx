import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import GameCard, { GameProps } from "./GameCard";
import GameFilter, { GameFilters } from "./GameFilter";
import { supabase } from "../../../supabase/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GameGrid() {
  const [games, setGames] = useState<GameProps[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch games with their requirements and eligibility
      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select(
          `
          *,
          game_requirements(*),
          game_eligibility(*)
        `,
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (gamesError) throw gamesError;

      // Transform the data to match our component interface
      const transformedGames: GameProps[] =
        gamesData?.map((game) => ({
          id: game.id,
          title: game.title,
          description: game.description,
          category: game.category,
          difficulty_level: game.difficulty_level,
          thumbnail_url: game.thumbnail_url,
          max_players: game.max_players,
          min_players: game.min_players,
          estimated_duration: game.estimated_duration,
          game_type: game.game_type,
          external_url: game.external_url,
          organizer_name: game.organizer_name,
          requirements: game.game_requirements?.sort(
            (a: any, b: any) => a.order_index - b.order_index,
          ),
          eligibility: game.game_eligibility,
        })) || [];

      setGames(transformedGames);
      setFilteredGames(transformedGames);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Failed to load games. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: GameFilters) => {
    let filtered = [...games];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.title.toLowerCase().includes(searchTerm) ||
          game.description?.toLowerCase().includes(searchTerm) ||
          game.category.toLowerCase().includes(searchTerm) ||
          game.organizer_name?.toLowerCase().includes(searchTerm),
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((game) => game.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty && filters.difficulty !== "all") {
      filtered = filtered.filter(
        (game) => game.difficulty_level === filters.difficulty,
      );
    }

    // Apply player count filter
    if (filters.playerCount && filters.playerCount !== "all") {
      filtered = filtered.filter((game) => {
        const minPlayers = game.min_players;
        const maxPlayers = game.max_players;

        switch (filters.playerCount) {
          case "1":
            return (
              minPlayers === 1 && (maxPlayers === 1 || maxPlayers === null)
            );
          case "2":
            return minPlayers <= 2 && (maxPlayers === null || maxPlayers >= 2);
          case "3-4":
            return minPlayers <= 4 && (maxPlayers === null || maxPlayers >= 3);
          case "5+":
            return maxPlayers === null || maxPlayers >= 5;
          default:
            return true;
        }
      });
    }

    // Apply game type filter
    if (filters.gameType && filters.gameType !== "all") {
      filtered = filtered.filter((game) => game.game_type === filters.gameType);
    }

    // Apply duration filter
    if (filters.duration && filters.duration !== "all") {
      filtered = filtered.filter((game) => {
        const duration = game.estimated_duration?.toLowerCase() || "";

        switch (filters.duration) {
          case "quick":
            return (
              duration.includes("15") ||
              duration.includes("10") ||
              duration.includes("5")
            );
          case "short":
            return duration.includes("15") || duration.includes("30");
          case "medium":
            return (
              duration.includes("30") ||
              duration.includes("60") ||
              duration.includes("hour")
            );
          case "long":
            return (
              duration.includes("hour") ||
              duration.includes("90") ||
              duration.includes("120")
            );
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "category":
            return a.category.localeCompare(b.category);
          case "difficulty":
            const difficultyOrder = {
              beginner: 1,
              intermediate: 2,
              advanced: 3,
            };
            return (
              (difficultyOrder[
                a.difficulty_level as keyof typeof difficultyOrder
              ] || 2) -
              (difficultyOrder[
                b.difficulty_level as keyof typeof difficultyOrder
              ] || 2)
            );
          case "players":
            return a.min_players - b.min_players;
          case "newest":
            return b.id.localeCompare(a.id);
          default:
            return 0;
        }
      });
    }

    setFilteredGames(filtered);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center py-10">
          <button
            onClick={fetchGames}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GameFilter onFilterChange={handleFilterChange} />

      {filteredGames.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-50 rounded-xl p-8 neumorphic-card">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No games found
            </h3>
            <p className="text-gray-600">
              {games.length === 0
                ? "No games have been added yet. Check back soon!"
                : "Try adjusting your filters or search terms to find more games."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredGames.length} of {games.length} games
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
