import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Clock,
  Users,
  ExternalLink,
  Heart,
  HeartOff,
  Star,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";

export interface GameProps {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty_level: string;
  thumbnail_url?: string;
  max_players?: number;
  min_players: number;
  estimated_duration?: string;
  game_type: string;
  external_url?: string;
  organizer_name?: string;
  requirements?: Array<{
    id: string;
    requirement_title: string;
    requirement_description: string;
    equipment_needed?: string;
    skill_level_required?: string;
  }>;
  eligibility?: Array<{
    id: string;
    requirement_type: string;
    requirement_description: string;
    is_mandatory: boolean;
  }>;
}

export default function GameCard({
  id = "1",
  title = "Chess Master Challenge",
  description = "Test your strategic thinking in this classic game of skill",
  category = "Strategy",
  difficulty_level = "intermediate",
  thumbnail_url,
  max_players = 2,
  min_players = 2,
  estimated_duration = "30-60 minutes",
  game_type = "skill",
  external_url,
  organizer_name = "Game Organizer",
  requirements = [
    {
      id: "1",
      requirement_title: "Chess Knowledge",
      requirement_description: "Basic understanding of chess rules and moves",
      equipment_needed: "Chess board and pieces",
      skill_level_required: "Beginner to Advanced",
    },
  ],
  eligibility = [
    {
      id: "1",
      requirement_type: "Age Requirement",
      requirement_description: "Must be 8 years or older",
      is_mandatory: true,
    },
  ],
}: Partial<GameProps>) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveGame = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (isSaved) {
        await supabase
          .from("saved_games")
          .delete()
          .eq("user_id", user.id)
          .eq("game_id", id);
        setIsSaved(false);
      } else {
        await supabase.from("saved_games").insert({
          user_id: user.id,
          game_id: id,
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving game:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlayersText = () => {
    if (min_players === max_players) {
      return `${min_players} player${min_players > 1 ? "s" : ""}`;
    }
    return `${min_players}-${max_players || "∞"} players`;
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div
          className="bg-white rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer
                    neumorphic-card relative overflow-hidden h-full flex flex-col justify-between group"
        >
          {thumbnail_url && (
            <div className="absolute inset-0 opacity-5 z-0 group-hover:opacity-10 transition-opacity">
              <img
                src={thumbnail_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <Badge
                variant="outline"
                className="bg-white/80 backdrop-blur-sm text-gray-700 font-medium px-3 py-1 rounded-full"
              >
                {category}
              </Badge>
              <Badge
                className={`${getDifficultyColor(difficulty_level)} border-none text-xs`}
              >
                {difficulty_level}
              </Badge>
            </div>

            <h3 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-2">
              {title}
            </h3>

            {description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{getPlayersText()}</span>
              </div>

              {estimated_duration && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{estimated_duration}</span>
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <Gamepad2 className="h-4 w-4 mr-2" />
                <span className="capitalize">{game_type} Game</span>
              </div>
            </div>
          </div>

          <div className="mt-4 relative z-10">
            <div className="flex gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 neumorphic-button border-none"
              >
                View Details
              </Button>
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveGame();
                  }}
                  disabled={isLoading}
                  className="neumorphic-button border-none p-2"
                >
                  {isSaved ? (
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  ) : (
                    <HeartOff className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            {external_url && (
              <Button
                variant="default"
                size="sm"
                className="w-full neumorphic-button flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(external_url, "_blank");
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Play Game
              </Button>
            )}
          </div>
        </div>
      </DrawerTrigger>

      <DrawerContent className="max-w-4xl mx-auto">
        <DrawerHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <DrawerTitle className="text-2xl font-bold mb-2">
                {title}
              </DrawerTitle>
              <DrawerDescription className="text-base">
                {description}
              </DrawerDescription>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">{category}</Badge>
                <Badge className={getDifficultyColor(difficulty_level)}>
                  {difficulty_level}
                </Badge>
                <Badge variant="secondary">{game_type}</Badge>
              </div>
            </div>
            {thumbnail_url && (
              <img
                src={thumbnail_url}
                alt={title}
                className="w-24 h-24 object-cover rounded-lg ml-4"
              />
            )}
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Player Information
                </h4>
                <p className="text-sm">
                  Players:{" "}
                  <span className="font-medium">{getPlayersText()}</span>
                </p>
                {estimated_duration && (
                  <p className="text-sm text-gray-600 mt-1">
                    Duration: {estimated_duration}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Organized by: {organizer_name}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Gamepad2 className="h-5 w-5 mr-2 text-purple-600" />
                  Game Type
                </h4>
                <p className="text-sm capitalize">
                  <span className="font-medium">{game_type} Game</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Category: {category}
                </p>
                <p className="text-sm text-gray-600">
                  Difficulty: {difficulty_level}
                </p>
              </div>
            </div>

            {/* Requirements & Eligibility */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-orange-600" />
                  Requirements
                </h4>
                <div className="space-y-3">
                  {requirements?.map((req) => (
                    <div key={req.id} className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-sm">
                        {req.requirement_title}
                      </h5>
                      <p className="text-xs text-gray-600 mt-1">
                        {req.requirement_description}
                      </p>
                      {req.equipment_needed && (
                        <p className="text-xs text-blue-600 mt-1">
                          Equipment: {req.equipment_needed}
                        </p>
                      )}
                      {req.skill_level_required && (
                        <p className="text-xs text-green-600 mt-1">
                          Skill Level: {req.skill_level_required}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Eligibility</h4>
                <div className="space-y-2">
                  {eligibility?.map((elig) => (
                    <div key={elig.id} className="flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${elig.is_mandatory ? "bg-red-500" : "bg-green-500"}`}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {elig.requirement_type}
                        </p>
                        <p className="text-xs text-gray-600">
                          {elig.requirement_description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {elig.is_mandatory ? "Required" : "Preferred"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <div className="flex gap-3">
            {external_url && (
              <Button
                className="flex-1"
                onClick={() => window.open(external_url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Play Game
              </Button>
            )}
            {user && (
              <Button
                variant="outline"
                onClick={handleSaveGame}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isSaved ? (
                  <>
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />{" "}
                    Saved
                  </>
                ) : (
                  <>
                    <HeartOff className="h-4 w-4" /> Save
                  </>
                )}
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
