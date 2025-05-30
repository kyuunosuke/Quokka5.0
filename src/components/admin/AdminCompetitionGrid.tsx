import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import {
  MoreHorizontal,
  Edit,
  Archive,
  Trash2,
  ExternalLink,
  Calendar,
  Trophy,
  Users,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { CompetitionProps } from "../competitions/CompetitionCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AdminCompetitionGridProps {
  searchQuery?: string;
  statusFilter?: string;
  onEdit?: (competition: CompetitionProps) => void;
  onView?: (competition: CompetitionProps) => void;
  refreshTrigger?: number;
  displayMode?: "grid" | "list";
}

export default function AdminCompetitionGrid({
  searchQuery = "",
  statusFilter = "all",
  onEdit,
  onView,
  refreshTrigger = 0,
  displayMode = "grid",
}: AdminCompetitionGridProps) {
  const { toast } = useToast();
  const [competitions, setCompetitions] = useState<CompetitionProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCompetitions();
  }, [refreshTrigger, statusFilter]);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("competitions")
        .select(
          `
          *,
          competition_requirements(*),
          competition_eligibility(*)
        `,
        )
        .order("created_at", { ascending: false });

      // Apply status filter
      const now = new Date().toISOString();

      if (statusFilter === "archived") {
        // Show only archived competitions
        query = query.eq("status", "archived");
      } else if (statusFilter === "all") {
        // Show all non-archived competitions
        query = query.or("status.is.null,status.neq.archived");
      } else if (statusFilter === "upcoming") {
        // Show upcoming competitions (deadline in future, not archived)
        query = query
          .gt("deadline", now)
          .or("status.is.null,status.neq.archived");
      } else if (statusFilter === "past") {
        // Show past competitions (deadline passed, not archived)
        query = query
          .lt("deadline", now)
          .or("status.is.null,status.neq.archived");
      } else if (statusFilter === "active") {
        // Show active competitions (deadline in future, not archived)
        query = query
          .gt("deadline", now)
          .or("status.is.null,status.neq.archived");
      } else if (statusFilter === "draft") {
        // Show draft competitions
        query = query.eq("status", "draft");
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedCompetitions: CompetitionProps[] =
        data?.map((comp) => ({
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
    } catch (error) {
      console.error("Error fetching competitions:", error);
      toast({
        title: "Error",
        description: "Failed to load competitions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (competitionId: string) => {
    setActionLoading(competitionId);
    try {
      const { error } = await supabase
        .from("competitions")
        .update({ status: "archived" })
        .eq("id", competitionId);

      if (error) throw error;

      toast({
        title: "Competition archived",
        description: "Competition has been moved to archive.",
      });

      fetchCompetitions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive competition.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (competitionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this competition? This action cannot be undone.",
      )
    ) {
      return;
    }

    setActionLoading(competitionId);
    try {
      // Delete related records first
      await supabase
        .from("competition_requirements")
        .delete()
        .eq("competition_id", competitionId);
      await supabase
        .from("competition_eligibility")
        .delete()
        .eq("competition_id", competitionId);
      await supabase
        .from("saved_competitions")
        .delete()
        .eq("competition_id", competitionId);

      // Delete the competition
      const { error } = await supabase
        .from("competitions")
        .delete()
        .eq("id", competitionId);

      if (error) throw error;

      toast({
        title: "Competition deleted",
        description: "Competition has been permanently deleted.",
      });

      fetchCompetitions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete competition.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (competition: CompetitionProps) => {
    const now = new Date();
    const deadline = new Date(competition.deadline);

    // Check if competition is archived first
    if (statusFilter === "archived") {
      return <Badge variant="secondary">Archived</Badge>;
    }

    // Check for draft status
    if (statusFilter === "draft") {
      return <Badge variant="outline">Draft</Badge>;
    }

    // Determine status based on deadline
    if (deadline < now) {
      return <Badge variant="secondary">Past</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
  };

  const formatPrizeValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Filter competitions based on search query
  const filteredCompetitions = competitions.filter((comp) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      comp.title.toLowerCase().includes(query) ||
      comp.description?.toLowerCase().includes(query) ||
      comp.category.toLowerCase().includes(query) ||
      comp.organizer_name?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" text="Loading competitions..." />
      </div>
    );
  }

  if (filteredCompetitions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-50 rounded-xl p-8 neumorphic-card max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No competitions found
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? "Try adjusting your search terms."
              : "Start by adding your first competition."}
          </p>
        </div>
      </div>
    );
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCompetitions.map((competition) => (
        <Card
          key={competition.id}
          className="bg-white hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{competition.category}</Badge>
                  {getStatusBadge(competition)}
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {competition.title}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(competition)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(competition)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {competition.external_url && (
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(competition.external_url, "_blank")
                      }
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Link
                    </DropdownMenuItem>
                  )}
                  {statusFilter !== "archived" && (
                    <DropdownMenuItem
                      onClick={() => handleArchive(competition.id)}
                      disabled={actionLoading === competition.id}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => handleDelete(competition.id)}
                    disabled={actionLoading === competition.id}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {competition.thumbnail_url && (
              <div className="w-full h-32 rounded-lg overflow-hidden">
                <img
                  src={competition.thumbnail_url}
                  alt={competition.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {competition.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {competition.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  Deadline: {format(competition.deadline, "MMM dd, yyyy")}
                </span>
              </div>

              <div className="flex items-center text-gray-600">
                <Trophy className="h-4 w-4 mr-2" />
                <span>{formatPrizeValue(competition.prize_value)}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>
                  {competition.current_participants}/
                  {competition.max_participants || "∞"} participants
                </span>
              </div>
            </div>

            {competition.organizer_name && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Organized by: {competition.organizer_name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Competition
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deadline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prize
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participants
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredCompetitions.map((competition) => (
            <tr key={competition.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {competition.thumbnail_url && (
                    <div className="flex-shrink-0 h-10 w-10 mr-3">
                      <img
                        src={competition.thumbnail_url}
                        alt={competition.title}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {competition.title}
                    </div>
                    {competition.organizer_name && (
                      <div className="text-xs text-gray-500">
                        by {competition.organizer_name}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline">{competition.category}</Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {format(competition.deadline, "MMM dd, yyyy")}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatPrizeValue(competition.prize_value)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {competition.current_participants}/
                {competition.max_participants || "∞"}
              </td>
              <td className="px-6 py-4">{getStatusBadge(competition)}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView?.(competition)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(competition)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {statusFilter !== "archived" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(competition.id)}
                      disabled={actionLoading === competition.id}
                      className="h-8 w-8 p-0"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(competition.id)}
                    disabled={actionLoading === competition.id}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Competition Management</h2>
        <p className="text-gray-600">
          Showing {filteredCompetitions.length} of {competitions.length}{" "}
          competitions
        </p>
      </div>

      {displayMode === "grid" ? renderGridView() : renderListView()}
    </div>
  );
}
