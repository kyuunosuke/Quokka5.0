import { useState, useEffect } from "react";
import RandomizerForm from "./RandomizerForm";
import RandomizerResults from "./RandomizerResults";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, History } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface RandomizerSession {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  num_winners: number;
}

export default function RandomizerPage() {
  const [currentView, setCurrentView] = useState<"form" | "results">("form");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<RandomizerSession[]>([]);
  const [loading, setLoading] = useState(true);

  const handleComplete = (id: string) => {
    setSessionId(id);
    setCurrentView("results");
    fetchSessions(); // Refresh history after new draw
  };

  const handleNewDraw = () => {
    setSessionId(null);
    setCurrentView("form");
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("randomizer_sessions")
        .select("id, title, description, created_at, num_winners")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching randomizer history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="flex">
      {/* Sidebar with history */}
      <div className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 p-4 h-screen overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Draw History</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No history yet
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-3">
                  <div className="text-sm font-medium mb-1">
                    {session.title}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {format(
                      new Date(session.created_at),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {session.num_winners} winner
                      {session.num_winners !== 1 && "s"}
                    </span>
                    <Link to={`/randomizer/results/${session.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="text-center pt-2">
              <Link to="/randomizer/history">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View All History
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Random Draw Generator
        </h1>
        <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Create fair and auditable random selections with cryptographic
          verification.
        </p>

        {currentView === "form" ? (
          <RandomizerForm onComplete={handleComplete} />
        ) : (
          sessionId && (
            <RandomizerResults
              sessionId={sessionId}
              onNewDraw={handleNewDraw}
            />
          )
        )}
      </div>
    </div>
  );
}
