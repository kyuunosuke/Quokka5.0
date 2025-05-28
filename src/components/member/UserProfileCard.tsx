import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { User, Mail, Calendar } from "lucide-react";

interface UserProfileCardProps {
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
    created_at?: string;
  };
  profile?: {
    full_name?: string;
    avatar_url?: string;
    total_xp?: number;
    level?: number;
    member_since?: string;
  };
}

export default function UserProfileCard({
  user,
  profile,
}: UserProfileCardProps = {}) {
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || "Member";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const email = user?.email || "member@example.com";
  const totalXp = profile?.total_xp || 1250;
  const level = profile?.level || 5;
  const memberSince = profile?.member_since || user?.created_at || "2024-01-01";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <User className="h-5 w-5 text-blue-600" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {displayName}
            </h3>
            <div className="flex items-center gap-1 text-gray-600 mt-1">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {totalXp.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total XP</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{level}</div>
            <div className="text-sm text-gray-600">Level</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Member since {new Date(memberSince).toLocaleDateString()}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Active Member</Badge>
          <Badge variant="outline">Level {level}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
