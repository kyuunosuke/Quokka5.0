import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, Trophy, Users, Clock } from "lucide-react";

interface Competition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "completed";
  participants_count?: number;
  user_rank?: number;
  xp_earned?: number;
}

interface CompetitionHistoryProps {
  competitions?: Competition[];
}

export default function CompetitionHistory({
  competitions = [
    {
      id: "1",
      title: "Winter Challenge 2024",
      description: "Complete daily fitness goals for 30 days",
      start_date: "2024-01-01",
      end_date: "2024-01-31",
      status: "completed",
      participants_count: 150,
      user_rank: 12,
      xp_earned: 500,
    },
    {
      id: "2",
      title: "Spring Sprint",
      description: "Weekly running challenges",
      start_date: "2024-03-01",
      end_date: "2024-03-31",
      status: "completed",
      participants_count: 89,
      user_rank: 8,
      xp_earned: 350,
    },
    {
      id: "3",
      title: "Summer Fitness Quest",
      description: "Multi-sport competition series",
      start_date: "2024-06-01",
      end_date: "2024-08-31",
      status: "active",
      participants_count: 200,
      user_rank: 15,
    },
    {
      id: "4",
      title: "Fall Marathon Prep",
      description: "12-week marathon training program",
      start_date: "2024-09-01",
      end_date: "2024-11-30",
      status: "upcoming",
      participants_count: 75,
    },
  ],
}: CompetitionHistoryProps = {}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Trophy className="h-4 w-4" />;
      case "active":
        return <Clock className="h-4 w-4" />;
      case "upcoming":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-purple-600" />
          Competition History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {competitions.map((competition) => (
            <div
              key={competition.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {competition.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {competition.description}
                  </p>
                </div>
                <Badge className={getStatusColor(competition.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(competition.status)}
                    {competition.status.charAt(0).toUpperCase() +
                      competition.status.slice(1)}
                  </span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(competition.start_date).toLocaleDateString()}
                  </span>
                </div>

                {competition.participants_count && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{competition.participants_count} participants</span>
                  </div>
                )}

                {competition.user_rank && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Trophy className="h-4 w-4" />
                    <span>Rank #{competition.user_rank}</span>
                  </div>
                )}

                {competition.xp_earned && (
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="font-semibold">
                      +{competition.xp_earned} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
