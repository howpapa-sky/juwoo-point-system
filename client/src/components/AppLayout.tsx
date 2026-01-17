import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Coins,
  ShoppingBag,
  BookOpen,
  Target,
  Award,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
  Shield,
  Settings,
  Gamepad2,
  Library,
  Home,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { APP_TITLE } from "@/const";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, userRole, signOut } = useSupabaseAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 하단 네비게이션 (모바일 주요 메뉴)
  const bottomNavItems = [
    { path: "/dashboard", label: "홈", icon: Home },
    { path: "/points-manage", label: "포인트", icon: Coins },
    { path: "/pokemon-quiz", label: "퀴즈", icon: Gamepad2 },
    { path: "/shop", label: "상점", icon: ShoppingBag },
    { path: "/my-page", label: "MY", icon: User },
  ];

  // 전체 메뉴 아이템
  const menuItems = [
    { path: "/dashboard", label: "대시보드", icon: LayoutDashboard, color: "from-violet-500 to-purple-600" },
    { path: "/points-manage", label: "포인트 관리", icon: Coins, color: "from-amber-500 to-orange-600" },
    { path: "/shop", label: "포인트 상점", icon: ShoppingBag, color: "from-pink-500 to-rose-600" },
    { path: "/pokemon-quiz", label: "포켓몬 퀴즈", icon: Gamepad2, color: "from-yellow-500 to-amber-600" },
    { path: "/ebook-library", label: "e북 도서관", icon: Library, color: "from-cyan-500 to-blue-600" },
    { path: "/english-learning", label: "영어 학습", icon: BookOpen, color: "from-emerald-500 to-teal-600" },
    { path: "/goals", label: "목표 설정", icon: Target, color: "from-red-500 to-rose-600" },
    { path: "/badges", label: "배지", icon: Award, color: "from-indigo-500 to-violet-600" },
    { path: "/statistics", label: "통계", icon: BarChart3, color: "from-slate-500 to-gray-600" },
  ];

  const adminMenuItems = [
    { path: "/admin/panel", label: "관리자 패널", icon: Shield },
    { path: "/admin/settings", label: "시스템 설정", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 배경 그라디언트 */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100/50 via-transparent to-rose-100/50 dark:from-violet-950/30 dark:to-rose-950/30 pointer-events-none" />

      {/* 모바일 헤더 - 글래스모피즘 */}
      <header
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-violet-100 dark:hover:bg-violet-900/30"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* 모바일 전체 메뉴 (슬라이드 오버) */}
      <div
        className={`lg:hidden fixed inset-0 z-[100] transition-all duration-300 ${
          isMobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* 오버레이 */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* 메뉴 패널 */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {user?.user_metadata?.name || "주우"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* 메뉴 리스트 */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] ${
                      isActive
                        ? "bg-violet-100 dark:bg-violet-900/30"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`flex-1 font-medium ${isActive ? "text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-300"}`}>
                      {item.label}
                    </span>
                    <ChevronRight className={`w-5 h-5 ${isActive ? "text-violet-500" : "text-slate-400"}`} />
                  </div>
                </Link>
              );
            })}

            {/* 관리자 메뉴 */}
            {userRole === "admin" && (
              <>
                <div className="pt-4 pb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4">
                    관리자
                  </p>
                </div>
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          isActive
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`flex-1 font-medium ${isActive ? "text-red-700 dark:text-red-300" : "text-slate-700 dark:text-slate-300"}`}>
                          {item.label}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* 로그아웃 */}
          <div className="p-4 border-t dark:border-slate-800">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-14 rounded-2xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium">로그아웃</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 데스크톱 사이드바 */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-40 h-screen w-72 flex-col bg-white dark:bg-slate-900 border-r dark:border-slate-800 shadow-xl">
        {/* 로고 */}
        <div className="p-6 border-b dark:border-slate-800">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {APP_TITLE}
                </h1>
                <p className="text-xs text-slate-500">포인트 시스템</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 유저 정보 */}
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {user?.user_metadata?.name || "주우"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          {userRole === "admin" && (
            <>
              <div className="pt-6 pb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4">
                  관리자
                </p>
              </div>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* 하단 */}
        <div className="p-4 border-t dark:border-slate-800 space-y-2">
          <Link href="/my-page">
            <Button variant="outline" className="w-full justify-start gap-2 rounded-xl h-11">
              <User className="w-4 h-4" />
              마이페이지
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-xl h-11 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="lg:ml-72 pt-14 pb-20 lg:pt-0 lg:pb-0 relative">
        <div className="min-h-screen">{children}</div>
      </main>

      {/* 모바일 하단 네비게이션 - 글래스모피즘 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t dark:border-slate-800 safe-area-pb">
        <div className="flex items-center justify-around h-16 px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className="flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all active:scale-95">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
                        : "bg-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? "text-white" : "text-slate-500 dark:text-slate-400"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium transition-colors ${
                      isActive
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Safe area bottom spacing for iOS */}
      <style>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </div>
  );
}
