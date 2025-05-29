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
  Trophy,
  Plus,
  Archive,
  Filter,
  Search,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface AdminLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
}

export default function AdminLayout({
  children,
  onSearch,
  onFilterChange,
}: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const sidebarItems = [
    {
      label: "All Competitions",
      href: "/admin",
      icon: <Trophy className="h-4 w-4" />,
      active: location.pathname === "/admin",
    },
    {
      label: "Add Competition",
      href: "/admin/add",
      icon: <Plus className="h-4 w-4" />,
      active: location.pathname === "/admin/add",
    },
    {
      label: "Archived",
      href: "/admin/archived",
      icon: <Archive className="h-4 w-4" />,
      active: location.pathname === "/admin/archived",
    },
  ];

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Past", value: "past" },
    { label: "Draft", value: "draft" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f3]">
      {/* Top Navigation */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-xl font-semibold text-gray-900">
              Admin Portal
            </Link>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search competitions..."
                className="pl-9 h-10 rounded-full bg-gray-100 border-0 text-sm focus:ring-2 focus:ring-gray-200"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
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
              Competition Management
            </h3>
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Status
            </h4>
            <div className="space-y-1">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm font-normal text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => onFilterChange?.(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
