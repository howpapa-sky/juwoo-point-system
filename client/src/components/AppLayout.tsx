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
} from "lucide-react";
import { useState } from "react";
import { APP_TITLE } from "@/const";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, userRole, signOut } = useSupabaseAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/dashboard", label: "대시보드", icon: LayoutDashboard },
    { path: "/points-manage", label: "포인트 관리", icon: Coins },
    { path: "/shop", label: "포인트 상점", icon: ShoppingBag },
    { path: "/pokemon-quiz", label: "포켓몬 퀴즈", icon: Gamepad2 },
    { path: "/english-learning", label: "영어 학습", icon: BookOpen },
    { path: "/goals", label: "목표 설정", icon: Target },
    { path: "/badges", label: "배지", icon: Award },
    { path: "/statistics", label: "통계", icon: BarChart3 },
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-purple-600">{APP_TITLE}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 bg-white border-r shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-purple-600">{APP_TITLE}</h1>
          </div>

          {/* User Info */}
          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user?.user_metadata?.name || user?.email || "사용자"}
                </p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-purple-100 text-purple-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* 관리자 메뉴 */}
            {userRole === 'admin' && (
              <>
                <div className="mt-6 mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                    관리자
                  </p>
                </div>
                <ul className="space-y-2">
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? "bg-red-100 text-red-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Link href="/my-page">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4 mr-2" />
                마이페이지
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
