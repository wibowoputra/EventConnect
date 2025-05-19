import { useState } from "react";
import { User, Registration, Event } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight,

  Download
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ParticipantTableProps {
  eventId: number;
}

interface ParticipantWithUser extends Registration {
  user?: User;
}

const ParticipantTable = ({ eventId }: ParticipantTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<number>(eventId);
  const itemsPerPage = 10;

  // Fetch events for dropdown
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
  });

  // Fetch registrations for the selected event
  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: [`/api/registrations?eventId=${selectedEvent}`],
  });

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  if (eventsLoading || registrationsLoading || usersLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Combine registration data with user data
  const participantsWithUsers: ParticipantWithUser[] = registrations?.map((registration: Registration) => {
    const user = users?.find((u: User) => u.id === registration.userId);
    return { ...registration, user };
  }) || [];

  // Pagination logic
  const totalPages = Math.ceil(participantsWithUsers.length / itemsPerPage);
  const paginatedParticipants = participantsWithUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEventChange = (value: string) => {
    setSelectedEvent(Number(value));
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "finished":
        return "bg-purple-100 text-purple-800";
      case "delayed":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Real-time Participant Tracking</h3>
        <div>
          <Select
            value={selectedEvent.toString()}
            onValueChange={handleEventChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Event" />
            </SelectTrigger>
            <SelectContent>
              {events?.map((event: Event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-4">
            <div>
              <h4 className="text-base font-medium text-gray-900">Active Participants Status</h4>
              <p className="text-sm text-gray-500">
                {events?.find((e: Event) => e.id === selectedEvent)?.title || "Loading..."}
              </p>
            </div>
            <div className="mt-3 sm:mt-0">
              <Button 
                variant="outline"
                className="inline-flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bib Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Checkpoint
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedParticipants.length > 0 ? (
                  paginatedParticipants.map((participant) => (
                    <tr key={participant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            {participant.user?.fullName.split(' ').map(n => n[0]).join('') || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {participant.user?.fullName || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {participant.user?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.bibNumber || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className={participant.category === "Marathon 42K" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                          {participant.category || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.status === 'active' 
                          ? 'Checkpoint 3 - 28km (10:45 AM)' 
                          : participant.status === 'finished'
                            ? 'Finished - 42km (11:05 AM)'
                            : 'Not started'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeClass(participant.status)}>
                          {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/participants/${participant.id}`}>
                          <a className="text-primary-600 hover:text-primary-900 mr-3">View</a>
                        </Link>
                        <Link href={`/participants/${participant.id}/contact`}>
                          <a className="text-primary-600 hover:text-primary-900">Contact</a>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No participants found for this event.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {participantsWithUsers.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, participantsWithUsers.length)}
                </span>{" "}
                of <span className="font-medium">{participantsWithUsers.length}</span> participants
              </div>
              <div className="flex-1 flex justify-end">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page numbers - simplified for brevity */}
                  {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                        ${currentPage === i + 1
                          ? "bg-primary-50 text-primary-600"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  {totalPages > 3 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )}
                  
                  {totalPages > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-white text-gray-500 hover:bg-gray-50"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantTable;
