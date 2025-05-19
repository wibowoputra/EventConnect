import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useDispatch, useSelector } from "react-redux";
import { 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp, 
  Pencil, 
  ArrowLeft, 
  Mail,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ParticipantTable from "@/components/participants/ParticipantTable";
import RacePackTable from "@/components/racepack/RacePackTable";
import { fetchEventById } from "@/store/eventsSlice";
import { fetchParticipantsByEvent } from "@/store/participantsSlice";
import { fetchRacePacksByEvent } from "@/store/racepacksSlice";
import { format } from "date-fns";
import type { AppDispatch, RootState } from "@/store/store";

const EventDetails = () => {
  const [, params] = useRoute("/events/:id");
  const [, setLocation] = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const eventId = params ? parseInt(params.id) : 0;
  
  // Fetch event details from Redux store
  const { currentEvent, status: eventStatus } = useSelector(
    (state: RootState) => state.events
  );
  
  // Fetch registrations for this event
  const { items: registrations, status: registrationsStatus } = useSelector(
    (state: RootState) => state.participants
  );

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
      dispatch(fetchParticipantsByEvent(eventId));
      dispatch(fetchRacePacksByEvent(eventId));
    }
  }, [dispatch, eventId]);

  if (!eventId) {
    return <div>Invalid event ID</div>;
  }

  if (eventStatus === "loading") {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-20 mr-4" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-40 w-full mt-6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentEvent) {
    return <div>Event not found</div>;
  }

  const { 
    title, 
    description, 
    date, 
    location, 
    category, 
    capacity, 
    price, 
    image, 
    status, 
    registrationOpen 
  } = currentEvent;
  
  const registrationsCount = registrations.length;
  const percentageFilled = capacity ? Math.round((registrationsCount / capacity) * 100) : 0;

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/events")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Badge className="ml-4" variant={status === "published" ? "default" : "outline"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
        <div className="md:col-span-2">
          <Card>
            <div className="relative h-64 w-full overflow-hidden">
              <img
                className="h-full w-full object-cover"
                src={image || "https://images.unsplash.com/photo-1594882645126-14020914d58d"}
                alt={title}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent px-4 py-3">
                <Badge className="bg-primary-100 text-primary-800">
                  {category}
                </Badge>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <span>{format(new Date(date), "MMMM d, yyyy 'at' h:mm a")}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="mr-2 h-4 w-4 text-gray-400" />
                  <span>
                    {registrationsCount} registrations
                    {capacity ? ` (${percentageFilled}% of capacity)` : ""}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">About this event</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Contact Participants
              </Button>
              <Button className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Event
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="mt-1 text-lg font-semibold">{price ? `$${price.toFixed(2)}` : "Free"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1">
                    <Badge variant={status === "published" ? "default" : "outline"}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Registration</p>
                  <p className="mt-1">
                    <Badge variant={registrationOpen ? "success" : "destructive"}>
                      {registrationOpen ? "Open" : "Closed"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Capacity</p>
                  <p className="mt-1 text-lg font-semibold">{capacity || "Unlimited"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Export Event Data
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Registration Progress</CardTitle>
              <CardDescription>
                {registrationsCount} out of {capacity || "∞"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {capacity ? (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${percentageFilled}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500">{percentageFilled}% filled</div>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">No capacity limit set</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="participants" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="participants" className="gap-2">
            <Users className="h-4 w-4" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="race-packs" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Race Packs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="participants">
          <ParticipantTable eventId={eventId} />
        </TabsContent>
        <TabsContent value="race-packs">
          <RacePackTable eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventDetails;
