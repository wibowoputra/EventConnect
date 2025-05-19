import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Calendar, 
  Users, 
  Box, 
  Bell, 
  Menu,
  Users2,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleNotificationClick = () => {
    toast({
      title: "No new notifications",
      description: "You're all caught up!",
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary-600 cursor-pointer">EventHub</h1>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main Navigation">
              <Link href="/">
                <a className={`${
                  location === "/" 
                    ? "border-primary-500 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Dashboard
                </a>
              </Link>
              <Link href="/events">
                <a className={`${
                  location.startsWith("/events") 
                    ? "border-primary-500 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Events
                </a>
              </Link>
              <Link href="/participants">
                <a className={`${
                  location === "/participants" 
                    ? "border-primary-500 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Participants
                </a>
              </Link>
              <Link href="/race-packs">
                <a className={`${
                  location === "/race-packs" 
                    ? "border-primary-500 text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Race Packs
                </a>
              </Link>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleNotificationClick}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </Button>

            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                      AO
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button 
              variant="ghost"
              size="sm"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className={`${
                location === "/" 
                  ? "bg-primary-50 border-primary-500 text-primary-700" 
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                <div className="flex items-center">
                  <BarChart className="mr-3 h-5 w-5" />
                  Dashboard
                </div>
              </a>
            </Link>
            <Link href="/events">
              <a className={`${
                location.startsWith("/events")
                  ? "bg-primary-50 border-primary-500 text-primary-700" 
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                <div className="flex items-center">
                  <Calendar className="mr-3 h-5 w-5" />
                  Events
                </div>
              </a>
            </Link>
            <Link href="/participants">
              <a className={`${
                location === "/participants"
                  ? "bg-primary-50 border-primary-500 text-primary-700" 
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                <div className="flex items-center">
                  <Users className="mr-3 h-5 w-5" />
                  Participants
                </div>
              </a>
            </Link>
            <Link href="/race-packs">
              <a className={`${
                location === "/race-packs"
                  ? "bg-primary-50 border-primary-500 text-primary-700" 
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                <div className="flex items-center">
                  <Box className="mr-3 h-5 w-5" />
                  Race Packs
                </div>
              </a>
            </Link>
            <Link href="/communities">
              <a className={`${
                location === "/communities"
                  ? "bg-primary-50 border-primary-500 text-primary-700" 
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                <div className="flex items-center">
                  <Users2 className="mr-3 h-5 w-5" />
                  Communities
                </div>
              </a>
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                  AO
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Event Organizer</div>
                <div className="text-sm font-medium text-gray-500">organizer@eventhub.com</div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleNotificationClick}
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </Button>
            </div>
            <div className="mt-3 space-y-1">
              <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Your Profile
              </a>
              <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Settings
              </a>
              <a href="#" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                Sign out
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
