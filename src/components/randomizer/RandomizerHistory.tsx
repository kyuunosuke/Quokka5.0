import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface RandomizerSession {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  num_winners: number;
}

export default function RandomizerHistory() {
  const [sessions, setSessions] = useState<RandomizerSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("randomizer_sessions")
          .select("id, title, description, created_at, num_winners")
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        console.error("Error fetching randomizer history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="bg-white shadow-md rounded-xl">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No random draws found.</p>
            <Link to="/randomizer">
              <Button>Create a new draw</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Random Draw History
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
        View your previous random draw results
      </p>

      <div className="space-y-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-medium">
                    {session.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {format(new Date(session.created_at), "PPP 'at' p")}
                  </p>
                </div>
                <Link to={`/randomizer/results/${session.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {session.description && (
                  <p className="text-gray-600 mb-2">{session.description}</p>
                )}
                <p className="text-gray-500">
                  {session.num_winners} winner{session.num_winners !== 1 && "s"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
