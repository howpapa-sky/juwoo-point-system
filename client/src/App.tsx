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
import Dashboard from "./pages/Dashboard";
import PointsManage from "./pages/PointsManage";
import Transactions from "./pages/Transactions";
import Shop from "./pages/Shop";
import AdminPanel from "./pages/AdminPanel";
import Statistics from "./pages/Statistics";
import EnglishLearning from "./pages/EnglishLearning";
import FlashCard from "./pages/FlashCard";
import EnglishQuiz from "./pages/EnglishQuiz";
import WordLearning from "./pages/WordLearning";
import LearningStats from "./pages/LearningStats";
import VoiceLearning from "./pages/VoiceLearning";
import Goals from "./pages/Goals";
import Badges from "./pages/Badges";
import MyPage from "./pages/MyPage";
import MyWallet from "./pages/MyWallet";
import Savings from "./pages/Savings";
import SeedFarm from "./pages/SeedFarm";
import GoalSaving from "./pages/GoalSaving";
import InvestReport from "./pages/InvestReport";
import SeedAlbum from "./pages/SeedAlbum";
import MistakeFriends from "./pages/MistakeFriends";
import AppLayout from "./components/AppLayout";
import RoutineTimeline from "./pages/RoutineTimeline";
import SleepBonus from "./pages/SleepBonus";
import WorryBox from "./pages/WorryBox";
import ParentDashboard from "./pages/ParentDashboard";
// Admin CMS imports
import AdminLayout from "./components/admin/AdminLayout";
import { AdminDashboard, AdminPointRules, AdminShopItems, AdminEbooks, AdminQuizzes, AdminWords, AdminBadges, AdminSettings, AdminAnalytics } from "./pages/admin";

function Router() {
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
      <Route path={"/points"}>
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
      <Route path={"/mistake-friends"}>
        {() => (
          <AppLayout>
            <MistakeFriends />
          </AppLayout>
        )}
      </Route>
      {/* Phase 1: 루틴, 수면, 걱정상자, 부모 대시보드 */}
      <Route path={"/routine"}>
        {() => (
          <AppLayout>
            <RoutineTimeline />
          </AppLayout>
        )}
      </Route>
      <Route path={"/sleep"}>
        {() => (
          <AppLayout>
            <SleepBonus />
          </AppLayout>
        )}
      </Route>
      <Route path={"/worry-box"}>
        {() => (
          <AppLayout>
            <WorryBox />
          </AppLayout>
        )}
      </Route>
      <Route path={"/parent"}>
        {() => (
          <AppLayout>
            <ParentDashboard />
          </AppLayout>
        )}
      </Route>
      <Route path="/wallet">
        {() => (
          <AppLayout>
            <MyWallet />
          </AppLayout>
        )}
      </Route>
      <Route path="/savings">
        {() => (
          <AppLayout>
            <Savings />
          </AppLayout>
        )}
      </Route>
      <Route path="/seed-farm">
        {() => (
          <AppLayout>
            <SeedFarm />
          </AppLayout>
        )}
      </Route>
      <Route path="/goal-saving">
        {() => (
          <AppLayout>
            <GoalSaving />
          </AppLayout>
        )}
      </Route>
      <Route path="/invest-report">
        {() => (
          <AppLayout>
            <InvestReport />
          </AppLayout>
        )}
      </Route>
      <Route path="/seed-album">
        {() => (
          <AppLayout>
            <SeedAlbum />
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
      {/* Admin CMS Routes */}
      <Route path="/admin">
        {() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/points/rules">
        {() => (
          <AdminLayout>
            <AdminPointRules />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/shop/items">
        {() => (
          <AdminLayout>
            <AdminShopItems />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/content/ebooks">
        {() => (
          <AdminLayout>
            <AdminEbooks />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/content/quizzes">
        {() => (
          <AdminLayout>
            <AdminQuizzes />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/content/words">
        {() => (
          <AdminLayout>
            <AdminWords />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/badges">
        {() => (
          <AdminLayout>
            <AdminBadges />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/analytics">
        {() => (
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/points/transactions">
        {() => (
          <AdminLayout>
            <Transactions />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <ThemeProvider
          defaultTheme="light"
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
