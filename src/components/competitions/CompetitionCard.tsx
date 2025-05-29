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
  CalendarIcon,
  Trophy,
  Users,
  Clock,
  ExternalLink,
  Heart,
  HeartOff,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";

export interface CompetitionProps {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  prize_value: number;
  prize_description: string;
  category: string;
  difficulty_level: string;
  thumbnail_url?: string;
  max_participants?: number;
  current_participants: number;
  external_url?: string;
  organizer_name?: string;
  requirements?: Array<{
    id: string;
    requirement_title: string;
    requirement_description: string;
    submission_format?: string;
  }>;
  eligibility?: Array<{
    id: string;
    requirement_type: string;
    requirement_description: string;
    is_mandatory: boolean;
  }>;
}

export default function CompetitionCard({
  id = "1",
  title = "Design Competition",
  description = "A creative design challenge for innovative minds",
  deadline = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
  prize_value = 1000,
  prize_description = "$1,000 Cash Prize",
  category = "Design",
  difficulty_level = "intermediate",
  thumbnail_url,
  max_participants = 100,
  current_participants = 25,
  external_url,
  organizer_name = "Competition Organizer",
  requirements = [
    {
      id: "1",
      requirement_title: "Design Submission",
      requirement_description: "Submit your original design in high resolution",
      submission_format: "PNG, JPG, or PDF",
    },
  ],
  eligibility = [
    {
      id: "1",
      requirement_type: "Age Requirement",
      requirement_description: "Must be 18 years or older",
      is_mandatory: true,
    },
  ],
}: Partial<CompetitionProps>) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveCompetition = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (isSaved) {
        await supabase
          .from("saved_competitions")
          .delete()
          .eq("user_id", user.id)
          .eq("competition_id", id);
        setIsSaved(false);
      } else {
        await supabase.from("saved_competitions").insert({
          user_id: user.id,
          competition_id: id,
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error saving competition:", error);
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

  const formatPrizeValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>Deadline: {format(deadline, "MMM dd, yyyy")}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Trophy className="h-4 w-4 mr-2" />
                <span>{formatPrizeValue(prize_value)}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>
                  {current_participants}/{max_participants || "∞"} participants
                </span>
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
                    handleSaveCompetition();
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
                Enter Competition
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
            {/* Competition Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                  Prize Information
                </h4>
                <p className="text-lg font-bold text-green-600">
                  {formatPrizeValue(prize_value)}
                </p>
                <p className="text-sm text-gray-600">{prize_description}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Timeline
                </h4>
                <p className="text-sm">
                  Deadline:{" "}
                  <span className="font-medium">
                    {format(deadline, "MMMM dd, yyyy 'at' h:mm a")}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {Math.ceil(
                    (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  )}{" "}
                  days remaining
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Participation
                </h4>
                <p className="text-sm">
                  Current:{" "}
                  <span className="font-medium">
                    {current_participants} participants
                  </span>
                </p>
                {max_participants && (
                  <p className="text-sm text-gray-600">
                    Maximum: {max_participants} participants
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Organized by: {organizer_name}
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
                      {req.submission_format && (
                        <p className="text-xs text-blue-600 mt-1">
                          Format: {req.submission_format}
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
                Enter Competition
              </Button>
            )}
            {user && (
              <Button
                variant="outline"
                onClick={handleSaveCompetition}
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
