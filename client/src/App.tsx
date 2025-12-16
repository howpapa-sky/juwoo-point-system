import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminSettings from "./pages/AdminSettings";
import Dashboard from "./pages/Dashboard";
import PointsManage from "./pages/PointsManage";
import Transactions from "./pages/Transactions";
import Shop from "./pages/Shop";
import AdminPanel from "./pages/AdminPanel";
import Statistics from "./pages/Statistics";
import EnglishLearning from "./pages/EnglishLearning";
import FlashCard from "./pages/FlashCard";
import EnglishQuiz from "./pages/EnglishQuiz";
import PokemonQuiz from "./pages/PokemonQuiz";
import EbookLibrary from "./pages/EbookLibrary";
import EbookReader from "./pages/EbookReader";
import WordLearning from "./pages/WordLearning";
import LearningStats from "./pages/LearningStats";
import VoiceLearning from "./pages/VoiceLearning";
import Goals from "./pages/Goals";
import Badges from "./pages/Badges";
import MyPage from "./pages/MyPage";
import AppLayout from "./components/AppLayout";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/dashboard"}>
        {() => (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>
      <Route path={"/points-manage"}>
        {() => (
          <AppLayout>
            <PointsManage />
          </AppLayout>
        )}
      </Route>
      <Route path={"/transactions"}>
        {() => (
          <AppLayout>
            <Transactions />
          </AppLayout>
        )}
      </Route>
      <Route path={"/shop"}>
        {() => (
          <AppLayout>
            <Shop />
          </AppLayout>
        )}
      </Route>
      <Route path={"/admin/panel"}>
        {() => (
          <AppLayout>
            <AdminPanel />
          </AppLayout>
        )}
      </Route>
      <Route path={"/admin/settings"}>
        {() => (
          <AppLayout>
            <AdminSettings />
          </AppLayout>
        )}
      </Route>
      <Route path={"/statistics"}>
        {() => (
          <AppLayout>
            <Statistics />
          </AppLayout>
        )}
      </Route>
      <Route path={"/english-learning"}>
        {() => (
          <AppLayout>
            <EnglishLearning />
          </AppLayout>
        )}
      </Route>
      <Route path={"/english-flashcard"}>
        {() => (
          <AppLayout>
            <FlashCard />
          </AppLayout>
        )}
      </Route>
      <Route path={"/english-quiz"}>
        {() => (
          <AppLayout>
            <EnglishQuiz />
          </AppLayout>
        )}
      </Route>
      <Route path={"/word-learning"}>
        {() => (
          <AppLayout>
            <WordLearning />
          </AppLayout>
        )}
      </Route>
      <Route path={"/learning-stats"}>
        {() => (
          <AppLayout>
            <LearningStats />
          </AppLayout>
        )}
      </Route>
      <Route path={"/voice-learning"}>
        {() => (
          <AppLayout>
            <VoiceLearning />
          </AppLayout>
        )}
      </Route>
      <Route path={"/pokemon-quiz"}>
        {() => (
          <AppLayout>
            <PokemonQuiz />
          </AppLayout>
        )}
      </Route>
      <Route path={"/ebook-library"}>
        {() => (
          <AppLayout>
            <EbookLibrary />
          </AppLayout>
        )}
      </Route>
      <Route path={"/ebook-reader/:bookId"}>
        {() => (
          <AppLayout>
            <EbookReader />
          </AppLayout>
        )}
      </Route>
      <Route path="/goals">
        {() => (
          <AppLayout>
            <Goals />
          </AppLayout>
        )}
      </Route>
      <Route path="/badges">
        {() => (
          <AppLayout>
            <Badges />
          </AppLayout>
        )}
      </Route>
      <Route path="/my-page">
        {() => (
          <AppLayout>
            <MyPage />
          </AppLayout>
        )}
      </Route>
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
