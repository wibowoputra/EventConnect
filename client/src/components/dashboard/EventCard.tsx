import { Link } from "wouter";
import { Calendar, MapPin, Users } from "lucide-react";
import { Event } from "@shared/schema";
import { format } from "date-fns";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const { id, title, date, location, image, category } = event;

  // Calculate registration percentage based on the event data in storage
  const registrationPercentage = Math.floor(Math.random() * 100); // For demonstration

  let categoryClass = "bg-primary-100 text-primary-800";
  if (category === "Running") {
    categoryClass = "bg-primary-100 text-primary-800";
  } else if (category === "Cycling") {
    categoryClass = "bg-green-100 text-green-800";
  } else if (category === "Swimming") {
    categoryClass = "bg-blue-100 text-blue-800";
  } else if (category === "Triathlon") {
    categoryClass = "bg-purple-100 text-purple-800";
  }

  return (
    <div className="event-card bg-white overflow-hidden shadow rounded-lg transition-all">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          className="h-full w-full object-cover"
          src={image || "https://images.unsplash.com/photo-1594882645126-14020914d58d"}
          alt={title}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryClass}`}>
            {category}
          </span>
        </div>
      </div>
      <div className="px-4 py-4">
        <h4 className="text-lg font-semibold text-gray-900 truncate">{title}</h4>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
          <span>{format(new Date(date), "MMMM d, yyyy")}</span>
        </div>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <MapPin className="mr-1.5 h-4 w-4 text-gray-400" />
          <span>{location}</span>
        </div>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <Users className="mr-1.5 h-4 w-4 text-gray-400" />
          <span>782 registrations</span>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full"
                  style={{ width: `${registrationPercentage}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs text-gray-500">{registrationPercentage}%</span>
            </div>
          </div>
          <div>
            <Link href={`/events/${id}`}>
              <a className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Manage
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
