import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface RandomizerFormProps {
  onComplete?: (sessionId: string) => void;
}

export default function RandomizerForm({ onComplete }: RandomizerFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [entrants, setEntrants] = useState("");
  const [numWinners, setNumWinners] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEntrants(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!title) {
        toast({
          title: "Error",
          description: "Please provide a title for this draw",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!entrants) {
        toast({
          title: "Error",
          description: "Please provide a list of entrants",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Parse entrants (comma, newline, or semicolon separated)
      const entrantsList = entrants
        .split(/[\n,;]/) // Split by newline, comma, or semicolon
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      if (entrantsList.length < numWinners) {
        toast({
          title: "Error",
          description: `You need at least ${numWinners} entrants to select ${numWinners} winner${numWinners > 1 ? "s" : ""}.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Generate a cryptographically secure random seed
      const randomBytes = new Uint8Array(32);
      window.crypto.getRandomValues(randomBytes);
      const seed = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Get current timestamp for proof
      const timestamp = new Date().toISOString();

      // Create a hash of the input data for auditability
      const inputData = JSON.stringify({
        entrants: entrantsList,
        numWinners,
        timestamp,
      });
      const inputHash = await crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(inputData))
        .then((hashBuffer) => {
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        });

      // Create a new randomizer session
      const { data: sessionData, error: sessionError } = await supabase
        .from("randomizer_sessions")
        .insert({
          user_id: user?.id,
          title,
          description,
          seed,
          input_hash: inputHash,
          num_winners: numWinners,
          timestamp_proof: timestamp,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Insert all entrants
      const entrantsToInsert = entrantsList.map((name) => ({
        session_id: sessionData.id,
        name,
      }));

      const { error: entrantsError } = await supabase
        .from("randomizer_entrants")
        .insert(entrantsToInsert);

      if (entrantsError) throw entrantsError;

      // Get all entrants with their IDs
      const { data: insertedEntrants, error: fetchError } = await supabase
        .from("randomizer_entrants")
        .select("id, name")
        .eq("session_id", sessionData.id);

      if (fetchError) throw fetchError;

      // Perform the random selection using the seed
      const seedUint8 = new Uint8Array(
        seed.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
      );
      const seededRandomFn = seedrandom(seedUint8);

      // Fisher-Yates shuffle algorithm with seeded random
      const shuffled = [...insertedEntrants];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandomFn() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Take the first numWinners as winners
      const winners = shuffled.slice(0, numWinners);

      // Record the results
      const resultsToInsert = winners.map((winner, index) => ({
        session_id: sessionData.id,
        entrant_id: winner.id,
        position: index + 1,
      }));

      const { error: resultsError } = await supabase
        .from("randomizer_results")
        .insert(resultsToInsert);

      if (resultsError) throw resultsError;

      toast({
        title: "Success!",
        description: `Random draw completed successfully with ${numWinners} winner${numWinners > 1 ? "s" : ""}.`,
      });

      // Call the onComplete callback with the session ID
      if (onComplete) {
        onComplete(sessionData.id);
      }
    } catch (error) {
      console.error("Error in randomizer:", error);
      toast({
        title: "Error",
        description: "Failed to complete the random draw. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Random Draw</CardTitle>
        <CardDescription>
          Create a fair and auditable random selection from a list of entrants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="E.g., Monthly Giveaway"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add details about this random draw"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entrants">Entrants</Label>
            <Textarea
              id="entrants"
              placeholder="Enter names separated by commas, semicolons, or new lines"
              value={entrants}
              onChange={(e) => setEntrants(e.target.value)}
              disabled={isLoading}
              className="min-h-[150px]"
            />
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-gray-500">
                {entrants
                  ? `${
                      entrants
                        .split(/[\n,;]/)
                        .filter((e) => e.trim().length > 0).length
                    } entrants`
                  : "No entrants yet"}
              </div>
              <div>
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Upload className="h-4 w-4" />
                  Upload CSV/TXT
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numWinners">Number of Winners</Label>
            <Input
              id="numWinners"
              type="number"
              min="1"
              value={numWinners}
              onChange={(e) => setNumWinners(parseInt(e.target.value) || 1)}
              disabled={isLoading}
              className="w-32"
            />
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full bg-blue-600 hover:bg-blue-700 text-white",
              isLoading && "opacity-70 cursor-not-allowed",
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Generate Random Results"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-gray-500">
        <p>
          This randomizer uses cryptographically secure random number generation
          and records a hash of the input data for auditability.
        </p>
      </CardFooter>
    </Card>
  );
}

// Simple seeded random number generator function
function seedrandom(seed: Uint8Array) {
  let state = Array.from(seed);

  return function () {
    let t = state[0] ^ (state[0] << 11);
    state[0] = state[1];
    state[1] = state[2];
    state[2] = state[3];
    state[3] = state[3] ^ (state[3] >> 19) ^ t ^ (t >> 8);
    return (state[3] >>> 0) / 0x100000000;
  };
}
