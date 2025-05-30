import { useEffect, useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Navigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { LoadingScreen } from "../ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import UserProfileCard from "./UserProfileCard";
import GamificationPanel from "./GamificationPanel";
import CompetitionHistory from "./CompetitionHistory";
import {
  Trophy,
  Calendar,
  Clock,
  Heart,
  Users,
  ExternalLink,
  User,
  Settings,
  LogOut,
  Home,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Database } from "../../types/supabase";

type Competition = Database["public"]["Tables"]["competitions"]["Row"];
type SavedCompetition =
  Database["public"]["Tables"]["saved_competitions"]["Row"];

interface CompetitionWithSaved extends Competition {
  is_saved?: boolean;
}

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function MemberDashboard() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [pastCompetitions, setPastCompetitions] = useState<Competition[]>([]);
  const [currentCompetitions, setCurrentCompetitions] = useState<
    CompetitionWithSaved[]
  >([]);
  const [savedCompetitions, setSavedCompetitions] = useState<
    CompetitionWithSaved[]
  >([]);
  const [loadingData, setLoadingData] = useState(true);
  const [competitionError, setCompetitionError] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    bio: "",
    location: "",
    website: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Get display name from user metadata or email
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  // Initialize profile form when user data is available
  useEffect(() => {
    if (user && !profileForm.fullName) {
      setProfileForm({
        fullName: user?.user_metadata?.full_name || "",
        email: user?.email || "",
        bio: user?.user_metadata?.bio || "",
        location: user?.user_metadata?.location || "",
        website: user?.user_metadata?.website || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Set profile data immediately
      setProfile({
        full_name: user?.user_metadata?.full_name || "Member",
        avatar_url: user?.user_metadata?.avatar_url,
        total_xp: 1250,
        level: 5,
        member_since: user?.created_at,
      });

      fetchCompetitionData();
    } else if (!loading) {
      // Only set loading to false if auth is not loading
      setLoadingData(false);
    }
  }, [user, loading]);

  const fetchCompetitionData = async () => {
    if (!user) {
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      setCompetitionError(null);

      // Fetch all competitions
      const { data: allCompetitions, error: competitionsError } = await supabase
        .from("competitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (competitionsError) {
        setCompetitionError(competitionsError.message);
        setLoadingData(false);
        return;
      }

      // Fetch user's saved competitions
      const { data: savedCompetitionsData, error: savedError } = await supabase
        .from("saved_competitions")
        .select("competition_id")
        .eq("user_id", user.id);

      if (savedError) {
        setCompetitionError(savedError.message);
        setLoadingData(false);
        return;
      }

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
      setLoadingData(false);
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.fullName,
          bio: profileForm.bio,
          location: profileForm.location,
          website: profileForm.website,
        },
      });

      if (error) throw error;

      setShowProfileDialog(false);
      // You could add a toast notification here for success
    } catch (error) {
      console.error("Error updating profile:", error);
      // You could add error handling/toast here
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading || loadingData) {
    return <LoadingScreen text="Loading member dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/memberlogin" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 rounded-xl flex items-center justify-center h-[20]">
                <Link to="/home">
                  <img
                    src="/quokkamole-new-logo.png"
                    alt="Quokkamole Logo"
                    className="h-10 w-10 object-contain cursor-pointer"
                  />
                </Link>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                QuokkaMole
              </span>
            </div>
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full p-0"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
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
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setShowProfileDialog(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setShowSettingsDialog(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={signOut}
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
          {/* Left Sidebar - Profile and Competitions */}
          <div className="lg:col-span-1">
            {/* Profile Card - Moved to top */}
            <div className="mb-6">
              <UserProfileCard user={user} profile={profile} />
            </div>

            {/* Past Competitions */}
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

            {/* Gamification Panel */}
            <div className="mt-6">
              <GamificationPanel
                currentXp={profile?.total_xp}
                level={profile?.level}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Competitions Tabs */}
            <Card className="bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  My Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="participated" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="participated"
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Participated
                    </TabsTrigger>
                    <TabsTrigger
                      value="saved"
                      className="flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Saved
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="participated" className="mt-6">
                    {currentCompetitions.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No participated competitions
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                  window.open(
                                    competition.external_url!,
                                    "_blank",
                                  )
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
                  </TabsContent>

                  <TabsContent value="saved" className="mt-6">
                    {savedCompetitions.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No saved competitions
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    window.open(
                                      competition.external_url!,
                                      "_blank",
                                    )
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
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your basic profile information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profileForm.fullName}
                onChange={(e) =>
                  handleProfileInputChange("fullName", e.target.value)
                }
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Email cannot be changed here
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileForm.bio}
                onChange={(e) =>
                  handleProfileInputChange("bio", e.target.value)
                }
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileForm.location}
                onChange={(e) =>
                  handleProfileInputChange("location", e.target.value)
                }
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={profileForm.website}
                onChange={(e) =>
                  handleProfileInputChange("website", e.target.value)
                }
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProfileDialog(false)}
                disabled={profileLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your account settings and preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Account Settings</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Email Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Settings
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Preferences</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Language & Region
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Theme Preferences
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Data & Privacy</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  Delete Account
                </Button>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSettingsDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
