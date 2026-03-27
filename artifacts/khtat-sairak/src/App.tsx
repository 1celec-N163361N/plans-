import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, RequireAuth } from "./contexts/AuthContext";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PlanForm from "./pages/PlanForm";
import PlanView from "./pages/PlanView";
import Invite from "./pages/Invite";
import Settings from "./pages/Settings";
import Docs from "./pages/Docs";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/invite/:token" component={Invite} />
      <Route path="/settings" component={Settings} />
      <Route path="/docs" component={Docs} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        <RequireAuth><Dashboard /></RequireAuth>
      </Route>
      <Route path="/plans/new">
        <RequireAuth><PlanForm /></RequireAuth>
      </Route>
      <Route path="/plans/:id/edit">
        <RequireAuth><PlanForm /></RequireAuth>
      </Route>
      <Route path="/plans/:id">
        <RequireAuth><PlanView /></RequireAuth>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster 
            position="top-center" 
            dir="rtl" 
            toastOptions={{
              className: 'font-sans glass-panel text-foreground border-white/10 rounded-2xl',
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
