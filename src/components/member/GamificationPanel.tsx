import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Trophy, Star, Target, Zap } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
}

interface GamificationPanelProps {
  currentXp?: number;
  nextLevelXp?: number;
  level?: number;
  achievements?: Achievement[];
}

export default function GamificationPanel({
  currentXp = 1250,
  nextLevelXp = 1500,
  level = 5,
  achievements = [
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first competition",
      icon: "🎯",
      earned_at: "2024-01-15",
    },
    {
      id: "2",
      name: "Rising Star",
      description: "Reach level 5",
      icon: "⭐",
      earned_at: "2024-02-01",
    },
    {
      id: "3",
      name: "Consistent Performer",
      description: "Participate in 10 competitions",
      icon: "🏆",
      earned_at: "2024-02-15",
    },
  ],
}: GamificationPanelProps = {}) {
  const progressPercentage = (currentXp / nextLevelXp) * 100;
  const xpToNext = nextLevelXp - currentXp;

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-600" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Level {level}
            </span>
            <span className="text-sm font-medium text-gray-600">
              Level {level + 1}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="text-center">
            <span className="text-lg font-semibold text-gray-900">
              {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
            </span>
            <p className="text-sm text-gray-600 mt-1">
              {xpToNext.toLocaleString()} XP to next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {achievement.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                  {achievement.earned_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Earned on{" "}
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800"
                >
                  Earned
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Target className="h-5 w-5 text-blue-600" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Star className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">15</div>
              <div className="text-sm text-gray-600">Competitions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">
                {achievements.length}
              </div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
