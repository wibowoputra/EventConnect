import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import Layout from "@/components/common/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import EventCreate from "@/pages/EventCreate";
import EventDetails from "@/pages/EventDetails";
import Participants from "@/pages/Participants";
import RacePacks from "@/pages/RacePacks";
import NotFound from "@/pages/not-found";

// Protected route wrapper
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any> }) {
  const [location] = useLocation();
  const isAuthenticated = localStorage.getItem("token") !== null;

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Component {...rest} />;
}

function Router() {
  const [location] = useLocation();
  const isPublicRoute = location === "/" || location === "/login";

  return (
    <>
      {isPublicRoute ? (
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      ) : (
        <Layout>
          <Switch>
            <Route path="/dashboard">
              <ProtectedRoute component={Dashboard} />
            </Route>
            <Route path="/events">
              <ProtectedRoute component={Events} />
            </Route>
            <Route path="/events/create">
              <ProtectedRoute component={EventCreate} />
            </Route>
            <Route path="/events/:id">
              <ProtectedRoute component={EventDetails} />
            </Route>
            <Route path="/participants">
              <ProtectedRoute component={Participants} />
            </Route>
            <Route path="/race-packs">
              <ProtectedRoute component={RacePacks} />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Layout>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
