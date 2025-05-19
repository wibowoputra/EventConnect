import { useState } from "react";
import { RacePack, Event } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Shirt, Medal, Hash, Droplets } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RacePackTableProps {
  eventId: number;
}

const RacePackTable = ({ eventId }: RacePackTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<number>(eventId);

  // Fetch events for dropdown
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
  });

  // Fetch race packs for the selected event
  const { data: racePacks, isLoading: racePacksLoading } = useQuery({
    queryKey: [`/api/race-packs?eventId=${selectedEvent}`],
  });

  if (eventsLoading || racePacksLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="bg-white shadow rounded-lg">
          <Skeleton className="h-12 w-full" />
          <div className="p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredRacePacks = racePacks?.filter((item: RacePack) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEventChange = (value: string) => {
    setSelectedEvent(Number(value));
  };

  const getItemIcon = (item: RacePack) => {
    switch(item.name.toLowerCase()) {
      case 'event t-shirt':
        return <Shirt className="text-xl" />;
      case 'finisher medal':
        return <Medal className="text-xl" />;
      case 'bib numbers':
        return <Hash className="text-xl" />;
      case 'energy drinks':
        return <Droplets className="text-xl" />;
      default:
        return <Shirt className="text-xl" />;
    }
  };

  const getStatusBadge = (item: RacePack) => {
    const status = item.stockQuantity - item.distributedQuantity <= 0.1 * item.stockQuantity 
      ? "Low Stock" 
      : "In Stock";
    const colorClass = status === "Low Stock" 
      ? "bg-yellow-100 text-yellow-800" 
      : "bg-green-100 text-green-800";
    
    return <Badge className={colorClass}>{status}</Badge>;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Race Pack Management</h3>
          <p className="mt-1 text-sm text-gray-500">Track and manage race packs for your events</p>
        </div>
        <div className="mt-4 md:mt-0">
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
        <Tabs defaultValue="inventory">
          <TabsList className="w-full border-b border-gray-200">
            <TabsTrigger value="inventory" className="w-1/3 py-3 text-sm">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="distribution" className="w-1/3 py-3 text-sm">
              Distribution
            </TabsTrigger>
            <TabsTrigger value="reports" className="w-1/3 py-3 text-sm">
              Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory" className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center sm:justify-between mb-5">
              <div>
                <h4 className="text-base font-medium text-gray-900">Race Pack Inventory</h4>
                <p className="text-sm text-gray-500">
                  {events?.find((e: Event) => e.id === selectedEvent)?.title || "Loading..."}
                </p>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4">
                <div className="relative mt-1 rounded-md shadow-sm max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input 
                    type="text"
                    placeholder="Search items"
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stock
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Distributed
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRacePacks.length > 0 ? (
                          filteredRacePacks.map((item: RacePack) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                                    {getItemIcon(item)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      SKU: {item.sku}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.stockQuantity} pcs
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.distributedQuantity} pcs
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(item)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-primary-600 hover:text-primary-900">Edit</a>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                              {searchTerm
                                ? "No items match your search"
                                : "No race pack items found for this event"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution">
            <div className="p-6 text-center text-gray-500">
              Distribution functionality will be available soon.
            </div>
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="p-6 text-center text-gray-500">
              Reports functionality will be available soon.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RacePackTable;
