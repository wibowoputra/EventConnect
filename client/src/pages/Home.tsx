import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">Welcome to EventConnect</h1>
            <p className="text-xl mb-8">
              Your one-stop platform for managing and participating in events. Join us to create
              unforgettable experiences.
            </p>
            <div className="space-x-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLocation("/login")}
              >
                Login
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-800"
                onClick={() => setLocation("/events")}
              >
                Browse Events
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Event Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Jakarta Marathon 2024</CardTitle>
              <CardDescription>March 15, 2024 • Jakarta</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Join thousands of runners in the annual Jakarta Marathon. Experience the city
                like never before.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/events/1")}>
                Learn More
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tech Conference 2024</CardTitle>
              <CardDescription>April 20, 2024 • Online</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                A virtual conference bringing together tech enthusiasts and professionals from
                around the world.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/events/2")}>
                Learn More
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Music Festival</CardTitle>
              <CardDescription>May 1, 2024 • Bali</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Three days of music, art, and culture in the beautiful setting of Bali.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/events/3")}>
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 