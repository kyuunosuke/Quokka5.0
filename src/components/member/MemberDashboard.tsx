import { useEffect, useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Navigate } from "react-router-dom";
import { Button } from "../ui/button";
import { LoadingScreen } from "../ui/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserProfileCard from "./UserProfileCard";
import GamificationPanel from "./GamificationPanel";
import CompetitionHistory from "./CompetitionHistory";
import {
  LogOut,
  Home,
  Settings,
  MessageCircle,
  User,
  Bell,
  Trophy,
  Calendar,
  Clock,
  Heart,
  Users,
  ExternalLink,
} from "lucide-react";
import { Database } from "../../types/supabase";

type Competition = Database["public"]["Tables"]["competitions"]["Row"];
type SavedCompetition =
  Database["public"]["Tables"]["saved_competitions"]["Row"];

interface CompetitionWithSaved extends Competition {
  is_saved?: boolean;
}

export default function MemberDashboard() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [pastCompetitions, setPastCompetitions] = useState<Competition[]>([]);
  const [currentCompetitions, setCurrentCompetitions] = useState<
    CompetitionWithSaved[]
  >([]);
  const [savedCompetitions, setSavedCompetitions] = useState<
    CompetitionWithSaved[]
  >([]);
  const [loadingCompetitions, setLoadingCompetitions] = useState(true);
  const [competitionError, setCompetitionError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCompetitionData();
      // Simulate loading profile data
      const timer = setTimeout(() => {
        setProfile({
          full_name: user?.user_metadata?.full_name || "Member",
          avatar_url: user?.user_metadata?.avatar_url,
          total_xp: 1250,
          level: 5,
          member_since: user?.created_at,
        });
        setLoadingProfile(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchCompetitionData = async () => {
    if (!user) return;

    try {
      setLoadingCompetitions(true);
      setCompetitionError(null);

      // Fetch all competitions
      const { data: allCompetitions, error: competitionsError } = await supabase
        .from("competitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (competitionsError) throw competitionsError;

      // Fetch user's saved competitions
      const { data: savedCompetitionsData, error: savedError } = await supabase
        .from("saved_competitions")
        .select("competition_id")
        .eq("user_id", user.id);

      if (savedError) throw savedError;

      const savedCompetitionIds = new Set(
        savedCompetitionsData?.map((sc) => sc.competition_id) || [],
      );

      // Categorize competitions
      const now = new Date();
      const past: Competition[] = [];
      const current: CompetitionWithSaved[] = [];
      const saved: CompetitionWithSaved[] = [];

      allCompetitions?.forEach((competition) => {
        const deadline = new Date(competition.deadline);
        const isSaved = savedCompetitionIds.has(competition.id);
        const competitionWithSaved = { ...competition, is_saved: isSaved };

        if (deadline < now) {
          past.push(competition);
        } else if (competition.status === "active") {
          current.push(competitionWithSaved);
        }

        if (isSaved) {
          saved.push(competitionWithSaved);
        }
      });

      setPastCompetitions(past);
      setCurrentCompetitions(current);
      setSavedCompetitions(saved);
    } catch (error) {
      console.error("Error fetching competition data:", error);
      setCompetitionError("Failed to load competition data");
    } finally {
      setLoadingCompetitions(false);
    }
  };

  const handleSaveCompetition = async (
    competitionId: string,
    isSaved: boolean,
  ) => {
    if (!user) return;

    try {
      if (isSaved) {
        await supabase
          .from("saved_competitions")
          .delete()
          .eq("user_id", user.id)
          .eq("competition_id", competitionId);
      } else {
        await supabase.from("saved_competitions").insert({
          user_id: user.id,
          competition_id: competitionId,
        });
      }

      // Refresh competition data
      fetchCompetitionData();
    } catch (error) {
      console.error("Error saving competition:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || "Member";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  if (loading || loadingProfile || loadingCompetitions) {
    return <LoadingScreen text="Loading member dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/memberlogin" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Home className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Member Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                        }
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          Level {profile?.level || 5}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {profile?.total_xp || 1250} XP
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>Support & Messages</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Past Competitions */}
          <div className="lg:col-span-1">
            <Card className="bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  Past Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {competitionError ? (
                  <p className="text-sm text-red-600">{competitionError}</p>
                ) : pastCompetitions.length === 0 ? (
                  <p className="text-sm text-gray-500">No past competitions</p>
                ) : (
                  <div className="space-y-3">
                    {pastCompetitions.slice(0, 5).map((competition) => (
                      <div
                        key={competition.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                          {competition.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(
                              competition.deadline,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge className="mt-2 text-xs bg-gray-100 text-gray-700">
                          {competition.category}
                        </Badge>
                      </div>
                    ))}
                    {pastCompetitions.length > 5 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        +{pastCompetitions.length - 5} more
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Card */}
            <div className="mt-6">
              <UserProfileCard user={user} profile={profile} />
            </div>

            {/* Gamification Panel */}
            <div className="mt-6">
              <GamificationPanel
                currentXp={profile?.total_xp}
                level={profile?.level}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Current Competitions */}
            <Card className="bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Current Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentCompetitions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No current competitions
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCompetitions.map((competition) => (
                      <div
                        key={competition.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {competition.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {competition.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleSaveCompetition(
                                competition.id,
                                competition.is_saved || false,
                              )
                            }
                            className="p-1"
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                competition.is_saved
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-400"
                              }`}
                            />
                          </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Deadline:{" "}
                              {new Date(
                                competition.deadline,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Trophy className="h-4 w-4" />
                            <span>
                              ${competition.prize_value.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>
                              {competition.current_participants || 0}{" "}
                              participants
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Badge className="bg-blue-100 text-blue-800">
                            {competition.category}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">
                            {competition.difficulty_level}
                          </Badge>
                        </div>

                        {competition.external_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                            onClick={() =>
                              window.open(competition.external_url!, "_blank")
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Enter Competition
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Competitions */}
            <Card className="bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-red-600" />
                  Saved Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedCompetitions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No saved competitions
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedCompetitions.map((competition) => (
                      <div
                        key={competition.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {competition.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {competition.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleSaveCompetition(competition.id, true)
                            }
                            className="p-1"
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Deadline:{" "}
                              {new Date(
                                competition.deadline,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Trophy className="h-4 w-4" />
                            <span>
                              ${competition.prize_value.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>
                              {competition.current_participants || 0}{" "}
                              participants
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Badge className="bg-blue-100 text-blue-800">
                            {competition.category}
                          </Badge>
                          <Badge
                            className={
                              new Date(competition.deadline) < new Date()
                                ? "bg-gray-100 text-gray-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {new Date(competition.deadline) < new Date()
                              ? "Ended"
                              : competition.difficulty_level}
                          </Badge>
                        </div>

                        {competition.external_url &&
                          new Date(competition.deadline) > new Date() && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3"
                              onClick={() =>
                                window.open(competition.external_url!, "_blank")
                              }
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Enter Competition
                            </Button>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
