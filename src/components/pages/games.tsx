import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Settings, User, Gamepad2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import GameGrid from "../games/GameGrid";

export default function GamesPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0f0f3] text-gray-800">
      {/* Apple-style navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(240,240,243,0.8)] backdrop-blur-md border-b border-[#e6e6e9]/30">
        <div className="max-w-[1200px] mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/quokkamole-logo.png"
                alt="Quokkamole Games Directory"
                className="h-8"
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-7 text-sm font-light">
            <Link to="/" className="hover:text-gray-500">
              Home
            </Link>
            <Link to="/games" className="hover:text-gray-500 font-medium">
              Games
            </Link>
            <Link to="/" className="hover:text-gray-500">
              Competitions
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-gray-500"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 hover:cursor-pointer neumorphic-card">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      {user.email}
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
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-gray-500"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-gray-800 text-white hover:bg-gray-700 text-sm px-4 neumorphic-button">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-12">
        {/* Hero section */}
        <section className="py-20 text-center">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex items-center justify-center mb-4">
              <Gamepad2 className="h-12 w-12 text-blue-600 mr-4" />
              <h2 className="text-5xl font-semibold tracking-tight">
                Games of Skill
              </h2>
            </div>
            <h3 className="text-2xl font-medium text-gray-600 mb-6">
              Challenge your mind with strategic and skill-based games
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Discover a curated collection of games that test your strategic
              thinking, problem-solving abilities, and mental agility. From
              classic board games to modern puzzles, find your next challenge
              here.
            </p>
            <div className="flex justify-center space-x-6 text-xl text-blue-600">
              <Link to="/" className="flex items-center hover:underline">
                Browse competitions <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/signup" className="flex items-center hover:underline">
                Join community <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Games Grid Section */}
        <section className="py-16 bg-[#f0f0f3]">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-4xl font-semibold tracking-tight mb-2 text-center">
              Available Games
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl mx-auto">
              Explore our collection of skill-based games and find the perfect
              challenge for your skill level
            </p>

            <GameGrid />
          </div>
        </section>

        {/* Features section */}
        <section className="py-20 bg-[#e8e8ec] text-center">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-4xl font-semibold tracking-tight mb-2">
              Why Play Games of Skill?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Games of skill offer unique benefits for mental development and
              entertainment
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#f0f0f3] p-8 rounded-2xl neumorphic-card text-left">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium mb-2">
                  Enhance Strategic Thinking
                </h4>
                <p className="text-gray-600">
                  Develop critical thinking and strategic planning skills
                  through challenging gameplay that rewards smart decisions.
                </p>
              </div>

              <div className="bg-[#f0f0f3] p-8 rounded-2xl neumorphic-card text-left">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium mb-2">Learn New Skills</h4>
                <p className="text-gray-600">
                  Master new games and techniques while improving pattern
                  recognition, memory, and problem-solving abilities.
                </p>
              </div>

              <div className="bg-[#f0f0f3] p-8 rounded-2xl neumorphic-card text-left">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium mb-2">
                  Connect with Players
                </h4>
                <p className="text-gray-600">
                  Join a community of skilled players, participate in
                  tournaments, and make lasting connections through shared
                  gaming experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#f0f0f3] text-center">
          <div className="max-w-[800px] mx-auto px-4">
            <div className="bg-[#e8e8ec] p-12 rounded-3xl neumorphic-card">
              <h2 className="text-3xl font-semibold mb-4">
                Ready to Challenge Yourself?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join our community and start exploring games that will test and
                improve your skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button className="px-8 py-6 h-auto text-lg rounded-xl bg-gray-800 text-white hover:bg-gray-700 neumorphic-button">
                    Join Community
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    variant="outline"
                    className="px-8 py-6 h-auto text-lg rounded-xl neumorphic-button border-none"
                  >
                    Browse Competitions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#e8e8ec] py-12 text-sm text-gray-600">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="border-b border-gray-300 pb-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-medium text-base text-gray-800 mb-4">
                Games Directory
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/games" className="hover:underline">
                    Browse Games
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Game Rules
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    How to Play
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Tournaments
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-base text-gray-800 mb-4">
                Game Categories
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/games" className="hover:underline">
                    Strategy Games
                  </Link>
                </li>
                <li>
                  <Link to="/games" className="hover:underline">
                    Puzzle Games
                  </Link>
                </li>
                <li>
                  <Link to="/games" className="hover:underline">
                    Card Games
                  </Link>
                </li>
                <li>
                  <Link to="/games" className="hover:underline">
                    Board Games
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-base text-gray-800 mb-4">
                Community
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Forums
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Leaderboards
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Player Profiles
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Events
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-base text-gray-800 mb-4">
                Support
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Report Issues
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="py-4">
            <p>© 2025 Quokkamole Games Directory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
