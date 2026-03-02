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
// AdminSettings moved to admin folder
import Dashboard from "./pages/Dashboard";
import PointsManage from "./pages/PointsManage";
import Transactions from "./pages/Transactions";
import Shop from "./pages/Shop";
import AdminPanel from "./pages/AdminPanel";
import Statistics from "./pages/Statistics";
import EnglishLearning from "./pages/EnglishLearning";
import EnglishHome from "./pages/EnglishHome";
import EnglishAdventure from "./pages/EnglishAdventure";
import EnglishReview from "./pages/EnglishReview";
import WordGarden from "./pages/WordGarden";
import EnglishStory from "./pages/EnglishStory";
import PronunciationPractice from "./pages/PronunciationPractice";
import ParentDashboard from "./pages/ParentDashboard";
import FlashCard from "./pages/FlashCard";
import EnglishQuiz from "./pages/EnglishQuiz";
import PokemonQuiz from "./pages/PokemonQuiz";
import DragonVillageQuiz from "./pages/DragonVillageQuiz";
import EbookLibrary from "./pages/EbookLibrary";
import EbookReader from "./pages/EbookReader";
import EbookQuiz from "./pages/EbookQuiz";
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
import AppLayout from "./components/AppLayout";
// Admin CMS imports
import AdminLayout from "./components/admin/AdminLayout";
import { AdminDashboard, AdminPointRules, AdminShopItems, AdminEbooks, AdminQuizzes, AdminWords, AdminBadges, AdminSettings, AdminAnalytics } from "./pages/admin";

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
      {/* Legacy admin settings route - redirects to new admin layout */}
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
            <EnglishHome />
          </AppLayout>
        )}
      </Route>
      <Route path={"/english-adventure"}>
        {() => (
          <AppLayout>
            <EnglishAdventure />
          </AppLayout>
        )}
      </Route>
      <Route path={"/english-review"}>
        {() => (
          <AppLayout>
            <EnglishReview />
          </AppLayout>
        )}
      </Route>
      <Route path={"/word-garden"}>
        {() => (
          <AppLayout>
            <WordGarden />
          </AppLayout>
        )}
      </Route>
      <Route path={"/english-story/:storyId"}>
        {() => (
          <AppLayout>
            <EnglishStory />
          </AppLayout>
        )}
      </Route>
      <Route path={"/pronunciation-practice"}>
        {() => (
          <AppLayout>
            <PronunciationPractice />
          </AppLayout>
        )}
      </Route>
      <Route path={"/parent-dashboard"}>
        {() => (
          <AppLayout>
            <ParentDashboard />
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
      <Route path={"/dragon-village-quiz"}>
        {() => (
          <AppLayout>
            <DragonVillageQuiz />
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
      <Route path={"/ebook-quiz/:bookId"}>
        {() => (
          <AppLayout>
            <EbookQuiz />
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
