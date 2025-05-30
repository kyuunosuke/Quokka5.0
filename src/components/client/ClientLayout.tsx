import { ReactNode } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  User,
  LogOut,
  Building2,
  Plus,
  FileText,
  Clock,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface ClientLayoutProps {
  children: ReactNode;
  onNavigate?: (view: string) => void;
}

export default function ClientLayout({
  children,
  onNavigate,
}: ClientLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const sidebarItems = [
    {
      label: "Dashboard",
      view: "overview",
      icon: <Building2 className="h-4 w-4" />,
    },
    {
      label: "Submit Competition",
      view: "submit",
      icon: <Plus className="h-4 w-4" />,
    },
    {
      label: "My Submissions",
      view: "submissions",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Pending Approval",
      view: "pending",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: "Past Submissions",
      view: "past",
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f3]">
      {/* Top Navigation */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/client" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">
                Client Portal
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-800"
              >
                View Public Site
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 hover:cursor-pointer">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                    alt={user?.email || ""}
                  />
                  <AvatarFallback>
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border-none shadow-lg"
              >
                <DropdownMenuLabel className="text-xs text-gray-500">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] mt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Competition Submissions
            </h3>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.view}
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100"
                  onClick={() => onNavigate?.(item.view)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Help Section */}
          <div className="p-6 border-t border-gray-200 mt-auto">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Need Help?
              </h4>
              <p className="text-xs text-blue-700 mb-3">
                Learn how to submit competitions effectively.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                View Guidelines
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
