import { useState, useEffect } from "react";
import ClientLayout from "./ClientLayout";
import CompetitionSubmissionForm from "./CompetitionSubmissionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Tables } from "@/types/supabase";
import { format } from "date-fns";

type Competition = Tables<"competitions">;

export default function ClientPortal() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<
    "submit" | "overview" | "submissions" | "pending" | "past"
  >("overview");
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
  }, [user]);

  const fetchCompetitions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("organizer_email", user.email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompetitions(data || []);
    } catch (error) {
      console.error("Error fetching competitions:", error);
    } finally {
      setLoading(false);
    }
  };

  const approvedCompetitions = competitions.filter(
    (comp) => comp.status === "approved" || comp.status === "active",
  );
  const pendingCompetitions = competitions.filter(
    (comp) => comp.status === "pending",
  );
  const pastCompetitions = competitions.filter((comp) => {
    const endDate = comp.end_date ? new Date(comp.end_date) : null;
    return endDate && endDate < new Date();
  });
  const needsRevisionCompetitions = competitions.filter(
    (comp) => comp.status === "revision" || comp.status === "rejected",
  );

  const stats = [
    {
      title: "Total Submissions",
      value: competitions.length.toString(),
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      description: "Competitions submitted",
    },
    {
      title: "Pending Approval",
      value: pendingCompetitions.length.toString(),
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      description: "Awaiting admin review",
    },
    {
      title: "Approved",
      value: approvedCompetitions.length.toString(),
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      description: "Live competitions",
    },
    {
      title: "Needs Revision",
      value: needsRevisionCompetitions.length.toString(),
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      description: "Requires changes",
    },
  ];

  const recentSubmissions = competitions.slice(0, 5).map((comp) => ({
    id: comp.id,
    title: comp.title,
    status: comp.status || "pending",
    submittedAt: comp.created_at
      ? format(new Date(comp.created_at), "yyyy-MM-dd")
      : "",
    prize: `${comp.prize_value.toLocaleString()}`,
    category: comp.category,
    endDate: comp.end_date
      ? format(new Date(comp.end_date), "yyyy-MM-dd")
      : null,
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case "revision":
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Needs Revision
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  const renderCompetitionList = (
    competitionList: Competition[],
    title: string,
    emptyMessage: string,
  ) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {competitionList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {competitionList.map((competition) => (
                <div
                  key={competition.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {competition.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {competition.category} • Prize: $
                      {competition.prize_value.toLocaleString()}
                      {competition.end_date && (
                        <>
                          {" "}
                          • Ends:{" "}
                          {format(
                            new Date(competition.end_date),
                            "MMM dd, yyyy",
                          )}
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted:{" "}
                      {competition.created_at
                        ? format(
                            new Date(competition.created_at),
                            "MMM dd, yyyy",
                          )
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(competition.status || "pending")}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleNavigation = (view: string) => {
    setActiveView(
      view as "submit" | "overview" | "submissions" | "pending" | "past",
    );
  };

  if (activeView === "submit") {
    return (
      <ClientLayout onNavigate={handleNavigation}>
        <div className="flex items-center justify-between p-6 pb-0">
          <Button
            variant="outline"
            onClick={() => setActiveView("overview")}
            className="mb-4"
          >
            ← Back to Overview
          </Button>
        </div>
        <CompetitionSubmissionForm />
      </ClientLayout>
    );
  }

  if (activeView === "submissions") {
    return (
      <ClientLayout onNavigate={handleNavigation}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">My Submissions</h1>
              <p className="text-gray-600">
                Approved competitions that are live or active
              </p>
            </div>
            <Button variant="outline" onClick={() => setActiveView("overview")}>
              ← Back to Overview
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading submissions...</p>
            </div>
          ) : (
            renderCompetitionList(
              approvedCompetitions,
              "Approved Competitions",
              "No approved competitions yet. Submit a competition to get started!",
            )
          )}
        </div>
      </ClientLayout>
    );
  }

  if (activeView === "pending") {
    return (
      <ClientLayout onNavigate={handleNavigation}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Pending Approval</h1>
              <p className="text-gray-600">
                Competitions awaiting admin review
              </p>
            </div>
            <Button variant="outline" onClick={() => setActiveView("overview")}>
              ← Back to Overview
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">
                Loading pending submissions...
              </p>
            </div>
          ) : (
            renderCompetitionList(
              pendingCompetitions,
              "Pending Competitions",
              "No pending competitions. All your submissions have been reviewed!",
            )
          )}
        </div>
      </ClientLayout>
    );
  }

  if (activeView === "past") {
    return (
      <ClientLayout onNavigate={handleNavigation}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Past Submissions</h1>
              <p className="text-gray-600">Competitions that have ended</p>
            </div>
            <Button variant="outline" onClick={() => setActiveView("overview")}>
              ← Back to Overview
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading past submissions...</p>
            </div>
          ) : (
            renderCompetitionList(
              pastCompetitions,
              "Past Competitions",
              "No past competitions yet.",
            )
          )}
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout onNavigate={handleNavigation}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Client Portal</h1>
            <p className="text-gray-600">
              Submit and manage your competition listings
            </p>
          </div>
          <Button
            onClick={() => setActiveView("submit")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Submit Competition
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const isClickable =
              stat.title === "Approved" || stat.title === "Pending Approval";
            const handleClick = () => {
              if (stat.title === "Approved") setActiveView("submissions");
              if (stat.title === "Pending Approval") setActiveView("pending");
            };

            return (
              <Card
                key={index}
                className={`bg-white transition-shadow ${
                  isClickable
                    ? "hover:shadow-md cursor-pointer"
                    : "hover:shadow-sm"
                }`}
                onClick={isClickable ? handleClick : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {loading ? "..." : stat.value}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {stat.description}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveView("submissions")}
          >
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                My Submissions
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                View your approved competitions
              </p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? "..." : approvedCompetitions.length}
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveView("pending")}
          >
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Pending Approval
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Competitions awaiting review
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {loading ? "..." : pendingCompetitions.length}
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveView("past")}
          >
            <CardContent className="p-6 text-center">
              <Archive className="h-8 w-8 text-gray-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Past Submissions
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Competitions that have ended
              </p>
              <p className="text-2xl font-bold text-gray-600">
                {loading ? "..." : pastCompetitions.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">
                  Loading recent submissions...
                </p>
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  No submissions yet. Submit your first competition to get
                  started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {submission.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {submission.category} • Submitted on{" "}
                        {submission.submittedAt} • Prize: {submission.prize}
                        {submission.endDate && (
                          <> • Ends: {submission.endDate}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(submission.status)}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">
                    Submit Your Competition
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Fill out the competition details form with all required
                    information.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Admin Review</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Our team will review your submission within 2-3 business
                    days.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Go Live</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Once approved, your competition will be published and
                    visible to participants.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
