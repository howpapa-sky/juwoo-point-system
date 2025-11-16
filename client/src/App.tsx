import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminSettings from "./pages/AdminSettings";
import Dashboard from "./pages/Dashboard";
import PointsManage from "./pages/PointsManage";
import Transactions from "./pages/Transactions";
import Shop from "./pages/Shop";
import AdminPanel from "./pages/AdminPanel";
import Statistics from "./pages/Statistics";
import EnglishLearning from "./pages/EnglishLearning";
import Goals from "./pages/Goals";
import Badges from "./pages/Badges";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/points"} component={PointsManage} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/shop"} component={Shop} />
      <Route path={"/admin/panel"} component={AdminPanel} />
      <Route path={"/admin/settings"} component={AdminSettings} />
      <Route path={"/statistics"} component={Statistics} />
      <Route path={"/english"} component={EnglishLearning} />
       <Route path="/goals" component={Goals} />
      <Route path="/badges" component={Badges} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </SupabaseAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
