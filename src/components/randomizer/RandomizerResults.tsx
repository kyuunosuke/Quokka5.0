import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trophy, Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RandomizerResultsProps {
  sessionId: string;
  onNewDraw?: () => void;
}

// For route params
interface RouteParams {
  sessionId: string;
}

interface Winner {
  position: number;
  name: string;
  entrant_id: string;
}

interface SessionDetails {
  title: string;
  description: string | null;
  created_at: string;
  seed: string;
  input_hash: string;
  num_winners: number;
  timestamp_proof: string;
}

import { useParams, useNavigate } from "react-router-dom";

export default function RandomizerResults({
  sessionId: propSessionId,
  onNewDraw,
}: RandomizerResultsProps) {
  const { sessionId: paramSessionId } = useParams<RouteParams>();
  const navigate = useNavigate();
  const sessionId = propSessionId || paramSessionId;

  // If accessed directly via URL and no onNewDraw prop
  const handleNewDrawFromRoute = () => {
    if (!onNewDraw) {
      navigate("/randomizer");
    } else {
      onNewDraw();
    }
  };
  const { toast } = useToast();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [entrantCount, setEntrantCount] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Fetch session details
        const { data: sessionData, error: sessionError } = await supabase
          .from("randomizer_sessions")
          .select("*")
          .eq("id", sessionId)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData);

        // Fetch winners with their names
        const { data: resultsData, error: resultsError } = await supabase
          .from("randomizer_results")
          .select(
            `
            position,
            entrant_id,
            randomizer_entrants!inner(name)
          `,
          )
          .eq("session_id", sessionId)
          .order("position");

        if (resultsError) throw resultsError;

        // Format the winners data
        const formattedWinners = resultsData.map((result) => ({
          position: result.position,
          name: result.randomizer_entrants.name,
          entrant_id: result.entrant_id,
        }));

        setWinners(formattedWinners);

        // Count total entrants
        const { count, error: countError } = await supabase
          .from("randomizer_entrants")
          .select("*", { count: "exact", head: true })
          .eq("session_id", sessionId);

        if (countError) throw countError;
        setEntrantCount(count || 0);
      } catch (error) {
        console.error("Error fetching randomizer results:", error);
        toast({
          title: "Error",
          description: "Failed to load the results. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchResults();
    }
  }, [sessionId, toast]);

  const handleExport = () => {
    if (!session || !winners.length) return;

    const timestamp = new Date(session.created_at)
      .toISOString()
      .replace(/[:.]/g, "-");
    const filename = `random-draw-${session.title.replace(/\s+/g, "-").toLowerCase()}-${timestamp}.json`;

    const exportData = {
      session: {
        id: sessionId,
        title: session.title,
        description: session.description,
        created_at: session.created_at,
        num_winners: session.num_winners,
        total_entrants: entrantCount,
        seed: session.seed,
        input_hash: session.input_hash,
        timestamp_proof: session.timestamp_proof,
      },
      winners: winners.map((winner) => ({
        position: winner.position,
        name: winner.name,
        entrant_id: winner.entrant_id,
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white shadow-md rounded-xl">
        <CardContent className="pt-6 flex justify-center items-center min-h-[300px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">Loading results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session || winners.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white shadow-md rounded-xl">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No results found for this draw.
            </p>
            <Button onClick={handleNewDrawFromRoute} variant="outline">
              Create a new draw
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          {session.title}
        </CardTitle>
        <CardDescription>
          {session.description || "Random draw results"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Draw completed on{" "}
            {new Date(session.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "medium",
            })}
          </div>
          <div className="text-sm text-gray-500">
            {entrantCount} total entrants, {session.num_winners} winner
            {session.num_winners > 1 ? "s" : ""}
          </div>
        </div>

        <div className="space-y-4">
          {winners.map((winner) => (
            <div
              key={winner.entrant_id}
              className={cn(
                "p-4 rounded-lg flex items-center",
                winner.position === 1
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-gray-50 border border-gray-200",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-4",
                  winner.position === 1
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700",
                )}
              >
                {winner.position === 1 ? (
                  <Trophy className="h-5 w-5" />
                ) : (
                  <span className="font-semibold">{winner.position}</span>
                )}
              </div>
              <div>
                <div className="font-medium">{winner.name}</div>
                <div className="text-xs text-gray-500">
                  {winner.position === 1
                    ? "Winner"
                    : `Runner-up #${winner.position - 1}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
        <div className="text-xs text-gray-500">
          <div>Verification Hash: {session.input_hash.substring(0, 16)}...</div>
          <div>Random Seed: {session.seed.substring(0, 16)}...</div>
          <div>
            Timestamp Proof: {new Date(session.timestamp_proof).toISOString()}
          </div>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-initial"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700"
            onClick={handleNewDrawFromRoute}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            New Draw
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
