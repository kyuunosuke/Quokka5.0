import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import CompetitionCard, { CompetitionProps } from "./CompetitionCard";
import CompetitionFilter, { CompetitionFilters } from "./CompetitionFilter";
import { supabase } from "../../../supabase/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CompetitionGrid() {
  const [competitions, setCompetitions] = useState<CompetitionProps[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<
    CompetitionProps[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch competitions with their requirements and eligibility
      const { data: competitionsData, error: competitionsError } =
        await supabase
          .from("competitions")
          .select(
            `
          *,
          competition_requirements(*),
          competition_eligibility(*)
        `,
          )
          .eq("status", "active")
          .order("created_at", { ascending: false });

      if (competitionsError) throw competitionsError;

      // Transform the data to match our component interface
      const transformedCompetitions: CompetitionProps[] =
        competitionsData?.map((comp) => ({
          id: comp.id,
          title: comp.title,
          description: comp.description,
          deadline: new Date(comp.deadline),
          prize_value: comp.prize_value,
          prize_description: comp.prize_description,
          category: comp.category,
          difficulty_level: comp.difficulty_level,
          thumbnail_url: comp.thumbnail_url,
          max_participants: comp.max_participants,
          current_participants: comp.current_participants,
          external_url: comp.external_url,
          organizer_name: comp.organizer_name,
          requirements: comp.competition_requirements?.sort(
            (a: any, b: any) => a.order_index - b.order_index,
          ),
          eligibility: comp.competition_eligibility,
        })) || [];

      setCompetitions(transformedCompetitions);
      setFilteredCompetitions(transformedCompetitions);
    } catch (err) {
      console.error("Error fetching competitions:", err);
      setError("Failed to load competitions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: CompetitionFilters) => {
    let filtered = [...competitions];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (comp) =>
          comp.title.toLowerCase().includes(searchTerm) ||
          comp.description?.toLowerCase().includes(searchTerm) ||
          comp.category.toLowerCase().includes(searchTerm) ||
          comp.organizer_name?.toLowerCase().includes(searchTerm),
      );
    }

    // Apply category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((comp) => comp.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty && filters.difficulty !== "all") {
      filtered = filtered.filter(
        (comp) => comp.difficulty_level === filters.difficulty,
      );
    }

    // Apply prize range filter
    if (filters.prizeRange && filters.prizeRange !== "all") {
      filtered = filtered.filter((comp) => {
        const prize = comp.prize_value;
        switch (filters.prizeRange) {
          case "0-1000":
            return prize >= 0 && prize <= 1000;
          case "1000-3000":
            return prize > 1000 && prize <= 3000;
          case "3000-5000":
            return prize > 3000 && prize <= 5000;
          case "5000+":
            return prize > 5000;
          default:
            return true;
        }
      });
    }

    // Apply timeframe filter
    if (filters.timeframe && filters.timeframe !== "all") {
      const now = new Date();
      filtered = filtered.filter((comp) => {
        const deadline = comp.deadline;
        const diffTime = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.timeframe) {
          case "week":
            return diffDays <= 7 && diffDays > 0;
          case "month":
            return diffDays <= 30 && diffDays > 0;
          case "quarter":
            return diffDays <= 90 && diffDays > 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "deadline":
            return a.deadline.getTime() - b.deadline.getTime();
          case "prize":
            return b.prize_value - a.prize_value;
          case "newest":
            return b.id.localeCompare(a.id);
          case "participants":
            return b.current_participants - a.current_participants;
          default:
            return 0;
        }
      });
    }

    setFilteredCompetitions(filtered);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading competitions...</p>
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
            onClick={fetchCompetitions}
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
      <CompetitionFilter onFilterChange={handleFilterChange} />

      {filteredCompetitions.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-50 rounded-xl p-8 neumorphic-card">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No competitions found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find more
              competitions.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredCompetitions.length} of {competitions.length}{" "}
            competitions
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompetitions.map((competition) => (
              <CompetitionCard key={competition.id} {...competition} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
