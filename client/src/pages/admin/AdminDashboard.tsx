import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  BookOpen,
  Gamepad2,
  Medal,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";

interface DashboardStats {
  currentPoints: number;
  todayEarned: number;
  todaySpent: number;
  totalRules: number;
  totalShopItems: number;
  totalEbooks: number;
  totalQuizzes: number;
  totalBadges: number;
  recentTransactions: Array<{
    id: number;
    amount: number;
    note: string;
    created_at: string;
    rule?: { name: string; category: string };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    currentPoints: 0,
    todayEarned: 0,
    todaySpent: 0,
    totalRules: 0,
    totalShopItems: 0,
    totalEbooks: 0,
    totalQuizzes: 0,
    totalBadges: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Get current points
      const { data: profile } = await supabase
        .from("juwoo_profile")
        .select("current_points")
        .eq("id", 1)
        .single();

      // Get today's transactions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayTx } = await supabase
        .from("point_transactions")
        .select("amount")
        .gte("created_at", today.toISOString());

      const todayEarned = todayTx?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0;
      const todaySpent = todayTx?.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

      // Get counts
      const [rulesRes, itemsRes, badgesRes, recentTxRes] = await Promise.all([
        supabase.from("point_rules").select("id", { count: "exact" }),
        supabase.from("shop_items").select("id", { count: "exact" }),
        supabase.from("badges").select("id", { count: "exact" }),
        supabase
          .from("point_transactions")
          .select("id, amount, note, created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setStats({
        currentPoints: profile?.current_points || 0,
        todayEarned,
        todaySpent,
        totalRules: rulesRes.count || 0,
        totalShopItems: itemsRes.count || 0,
        totalEbooks: 2, // From booksData
        totalQuizzes: 30, // Estimated
        totalBadges: badgesRes.count || 0,
        recentTransactions: recentTxRes.data || [],
      });

      setLoading(false);
    };

    fetchStats();
  }, []);

  const quickActions = [
    { title: "포인트 규칙", href: "/admin/points/rules", icon: Coins, color: "bg-green-500" },
    { title: "상점 아이템", href: "/admin/shop/items", icon: ShoppingBag, color: "bg-blue-500" },
    { title: "e북 관리", href: "/admin/content/ebooks", icon: BookOpen, color: "bg-purple-500" },
    { title: "퀴즈 관리", href: "/admin/content/quizzes", icon: Gamepad2, color: "bg-pink-500" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">대시보드</h1>
        <p className="text-muted-foreground mt-1">주우 놀이시스템 관리 현황</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Points */}
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">현재 포인트</p>
                <p className="text-3xl font-bold text-amber-600">{stats.currentPoints.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Coins className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today Earned */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">오늘 적립</p>
                <p className="text-3xl font-bold text-green-600">+{stats.todayEarned.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today Spent */}
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">오늘 사용</p>
                <p className="text-3xl font-bold text-red-600">-{stats.todaySpent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Change */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">오늘 변동</p>
                <p className={`text-3xl font-bold ${stats.todayEarned - stats.todaySpent >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {stats.todayEarned - stats.todaySpent >= 0 ? '+' : ''}{(stats.todayEarned - stats.todaySpent).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Coins className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalRules}</p>
              <p className="text-xs text-muted-foreground">포인트 규칙</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalShopItems}</p>
              <p className="text-xs text-muted-foreground">상점 아이템</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalEbooks}</p>
              <p className="text-xs text-muted-foreground">e북</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Medal className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalBadges}</p>
              <p className="text-xs text-muted-foreground">배지</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 관리 기능</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="outline" className="w-full justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 ${action.color} rounded`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <span>{action.title}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">최근 거래 내역</CardTitle>
              <CardDescription>최근 10개 거래</CardDescription>
            </div>
            <Link href="/admin/points/transactions">
              <Button variant="ghost" size="sm">
                전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentTransactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">거래 내역이 없습니다</p>
              ) : (
                stats.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.amount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        {tx.amount >= 0 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{tx.note || "알 수 없는 거래"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(tx.created_at).toLocaleString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <Badge variant={tx.amount >= 0 ? "default" : "destructive"} className="font-mono">
                      {tx.amount >= 0 ? "+" : ""}{tx.amount}P
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts / Notifications */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
            <Activity className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-800 dark:text-amber-200">시스템 알림</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              노코드 어드민 CMS가 활성화되었습니다. 코드 없이 모든 콘텐츠를 관리할 수 있습니다!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
