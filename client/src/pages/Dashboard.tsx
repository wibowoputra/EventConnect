import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Users2, Box, MailPlus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import EventCard from "@/components/dashboard/EventCard";
import ManagementTool from "@/components/dashboard/ManagementTool";
import { fetchEvents } from "@/store/eventsSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { Event } from "@shared/schema";

interface DashboardStats {
  activeEvents: number;
  totalRegistrations: number;
  communities: number;
  revenue: number;
}

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Fetch statistics data
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
  });

  // Fetch events from Redux store
  const { items: events, status: eventsStatus } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    if (eventsStatus === "idle") {
      dispatch(fetchEvents());
    }
  }, [dispatch, eventsStatus]);

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => selectedCategory === "all" || event.category === selectedCategory)
    .filter((event) => event.status === "published")
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  return (
    <div>
      {/* Organizer Dashboard */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">Overview of your events and performance</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/events/create">
              <Button className="inline-flex items-center px-4 py-2">
                <Calendar className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white shadow rounded-lg p-6">
                <Skeleton className="h-10 w-10 rounded-md mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
                <div className="mt-5">
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))
          ) : (
            <>
              <StatCard
                title="Active Events"
                value={stats?.activeEvents || 0}
                icon={<Calendar className="h-6 w-6" />}
                iconBgColor="bg-primary-100"
                iconColor="text-primary-600"
                linkText="View all events"
                linkHref="/events"
              />
              <StatCard
                title="Total Registrations"
                value={stats?.totalRegistrations || 0}
                icon={<Users2 className="h-6 w-6" />}
                iconBgColor="bg-green-100"
                iconColor="text-secondary-500"
                linkText="View participants"
                linkHref="/participants"
              />
              <StatCard
                title="Communities"
                value={stats?.communities || 0}
                icon={<Users2 className="h-6 w-6" />}
                iconBgColor="bg-accent-100"
                iconColor="text-accent-500"
                linkText="Manage communities"
                linkHref="#"
              />
              <StatCard
                title="Revenue"
                value={`$${stats?.revenue.toLocaleString() || 0}`}
                icon={<Box className="h-6 w-6" />}
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                linkText="View financial report"
                linkHref="#"
              />
            </>
          )}
        </div>

        {/* Active Events */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Active Events</h3>
            <div className="flex">
              <div className="relative">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Cycling">Cycling</SelectItem>
                    <SelectItem value="Swimming">Swimming</SelectItem>
                    <SelectItem value="Triathlon">Triathlon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative ml-2">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Date (newest)</SelectItem>
                    <SelectItem value="oldest">Date (oldest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {eventsStatus === "loading" ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-2 w-3/4 rounded-full" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredEvents.length > 0 ? (
            filteredEvents.slice(0, 3).map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-3 text-center py-10 text-gray-500">
              No active events found for the selected category.
            </div>
          )}
        </div>
      </div>

      {/* Event Management Tools */}
      <div className="mb-10 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Event Management Tools
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Quick access to essential event management features
          </p>
        </div>
        <div className="py-5 px-4 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ManagementTool
              title="Participant Management"
              description="Register, track, and manage event participants efficiently"
              icon={<Users2 className="h-6 w-6" />}
              href="/participants"
            />
            <ManagementTool
              title="Race Pack Management"
              description="Track race packs, distributions, and inventory status"
              icon={<Box className="h-6 w-6" />}
              href="/race-packs"
            />
            <ManagementTool
              title="Form Builder"
              description="Create custom registration forms for your events"
              icon={<FileText className="h-6 w-6" />}
              href="#"
            />
            <ManagementTool
              title="Communication Tools"
              description="Send announcements, updates and notifications to participants"
              icon={<MailPlus className="h-6 w-6" />}
              href="#"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
