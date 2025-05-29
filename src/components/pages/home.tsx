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
import { ChevronRight, Settings, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import CompetitionGrid from "../competitions/CompetitionGrid";

export default function LandingPage() {
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
                alt="Quokkamole Competition Directory"
                className="h-8"
              />
            </Link>
          </div>
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
                <Link to="/dashboard">
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
            <h2 className="text-5xl font-semibold tracking-tight mb-1">
              Quokkamole
            </h2>
            <h3 className="text-2xl font-medium text-gray-600 mb-6">
              Discover and participate in exciting competitions
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Browse through our curated list of competitions across various
              categories. Find opportunities to showcase your skills, win
              prizes, and advance your career.
            </p>
            <div className="flex justify-center space-x-6 text-xl text-blue-600">
              <Link to="/" className="flex items-center hover:underline">
                Learn more <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/signup" className="flex items-center hover:underline">
                Get started <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Competition Grid Section */}
        <section className="py-16 bg-[#f0f0f3]">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-4xl font-semibold tracking-tight mb-2 text-center">
              Active Competitions
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl mx-auto">
              Browse through our current competitions and find the perfect
              opportunity to showcase your talents
            </p>

            <CompetitionGrid />
          </div>
        </section>

        {/* Features section */}
        <section className="py-20 bg-[#e8e8ec] text-center">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-4xl font-semibold tracking-tight mb-2">
              Why Participate?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Competitions offer unique opportunities to challenge yourself,
              gain recognition, and win rewards
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium mb-2">
                  Showcase Your Skills
                </h4>
                <p className="text-gray-600">
                  Demonstrate your expertise and creativity to a wider audience
                  and potential clients or employers.
                </p>
              </div>

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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium mb-2">Win Prizes</h4>
                <p className="text-gray-600">
                  Earn recognition and rewards for your hard work, including
                  cash prizes, job opportunities, and more.
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium mb-2">Grow Your Network</h4>
                <p className="text-gray-600">
                  Connect with industry professionals, peers, and potential
                  collaborators in your field.
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
                Ready to Participate?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join our community today and start discovering competitions
                tailored to your skills and interests.
              </p>
              <Link to="/signup">
                <Button className="px-8 py-6 h-auto text-lg rounded-xl bg-gray-800 text-white hover:bg-gray-700 neumorphic-button">
                  Create Your Account
                </Button>
              </Link>
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
                Competition Directory
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-base text-gray-800 mb-4">
                Categories
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Design
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Development
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Marketing
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Writing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-base text-gray-800 mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-base text-gray-800 mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Competition Rules
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="py-4">
            <p>© 2025 Competition Directory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
