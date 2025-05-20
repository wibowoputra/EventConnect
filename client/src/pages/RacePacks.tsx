import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Box, Download, Plus, AlertTriangle, Link } from "lucide-react";
import RacePackTable from "@/components/racepack/RacePackTable";
import { fetchEvents } from "@/store/eventsSlice";
import { fetchRacePacksByEvent } from "@/store/racepacksSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { Event, RacePack } from "@shared/schema";

const RacePacks = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  
  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  
  // Get race packs from Redux store
  const { items: racePacks, status: racePacksStatus } = useSelector(
    (state: RootState) => state.racepacks
  );

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
      dispatch(fetchRacePacksByEvent(events[0].id));
    }
  }, [events, selectedEvent, dispatch]);

  const handleEventChange = (eventId: string) => {
    const id = parseInt(eventId);
    setSelectedEvent(id);
    dispatch(fetchRacePacksByEvent(id));
  };

  // Find low stock items
  const lowStockItems = racePacks.filter((item: RacePack) => {
    return item.stockQuantity - (item.distributedQuantity || 0) <= 0.1 * item.stockQuantity;
  });

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
            <p className="text-gray-500 mb-4">Please create an event first to manage race packs.</p>
            <Button asChild>
              <Link href="/events/create">Create Event</Link>
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
          <h2 className="text-2xl font-bold text-gray-900">Race Pack Management</h2>
          <p className="mt-1 text-sm text-gray-500">Track and manage race packs for all your events</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Inventory
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Race Pack Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Event</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded bg-primary-100 flex items-center justify-center text-primary-600">
                      <Box className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Total Items</div>
                      <div className="text-2xl font-semibold">{racePacks.length}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded bg-secondary-100 flex items-center justify-center text-secondary-600">
                      <Box className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Distributed</div>
                      <div className="text-2xl font-semibold">
                        {racePacks.reduce((sum, item) => sum + (item.distributedQuantity || 0), 0)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded bg-yellow-100 flex items-center justify-center text-yellow-600">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">Low Stock Items</div>
                      <div className="text-2xl font-semibold">{lowStockItems.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedEvent && <RacePackTable eventId={selectedEvent} />}
    </div>
  );
};

export default RacePacks;
