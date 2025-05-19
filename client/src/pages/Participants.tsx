import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, UserPlus, Filter } from "lucide-react";
import ParticipantTable from "@/components/participants/ParticipantTable";
import { fetchEvents } from "@/store/eventsSlice";
import { fetchParticipantsByEvent } from "@/store/participantsSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { Event } from "@shared/schema";

const Participants = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
  });
  
  // Fetch active events from Redux store
  const { items: storeEvents, status: eventsStatus } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    if (eventsStatus === "idle") {
      dispatch(fetchEvents());
    }
  }, [dispatch, eventsStatus]);

  // Set the first event as selected when events load
  useEffect(() => {
    if (events && events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0].id);
      dispatch(fetchParticipantsByEvent(events[0].id));
    }
  }, [events, selectedEvent, dispatch]);

  const handleEventChange = (eventId: string) => {
    const id = parseInt(eventId);
    setSelectedEvent(id);
    dispatch(fetchParticipantsByEvent(id));
  };

  if (eventsLoading || eventsStatus === "loading") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div>
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-500 mb-4">Please create an event first to manage participants.</p>
            <Button href="/events/create" asChild>
              <a>Create Event</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeEvents = events.filter((event: Event) => event.status === "published");

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Participants Management</h2>
          <p className="mt-1 text-sm text-gray-500">Track and manage participants across all your events</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Participant
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-72">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Event
              </label>
              <Select 
                value={selectedEvent?.toString() || ""} 
                onValueChange={handleEventChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {activeEvents.map((event: Event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Participants
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search by name, email, or bib number..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Participants</TabsTrigger>
          <TabsTrigger value="active">
            Active
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">4</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">12</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">23</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {selectedEvent && <ParticipantTable eventId={selectedEvent} />}
        </TabsContent>
        <TabsContent value="active">
          {selectedEvent && <ParticipantTable eventId={selectedEvent} />}
        </TabsContent>
        <TabsContent value="pending">
          {selectedEvent && <ParticipantTable eventId={selectedEvent} />}
        </TabsContent>
        <TabsContent value="completed">
          {selectedEvent && <ParticipantTable eventId={selectedEvent} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Participants;
