import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Coins, TrendingUp, TrendingDown, Activity, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const { data: balance, isLoading: balanceLoading } = trpc.points.balance.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: stats, isLoading: statsLoading } = trpc.points.stats.useQuery(
    { days: 7 },
    { enabled: isAuthenticated }
  );
  const { data: transactions, isLoading: transactionsLoading } = trpc.points.transactions.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );
  const utils = trpc.useUtils();
  const cancelMutation = trpc.transactions.cancel.useMutation({
    onSuccess: () => {
      utils.points.balance.invalidate();
      utils.points.transactions.invalidate();
      utils.points.stats.invalidate();
      toast.success("포인트가 취소되었습니다!");
    },
    onError: (error) => {
      toast.error(error.message || "취소에 실패했습니다.");
    },
  });

  const handleCancel = (transactionId: number) => {
    if (confirm("정말로 이 거래를 취소하시겠습니까?")) {
      cancelMutation.mutate({ transactionId });
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>대시보드를 보려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">로그인하기</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loading = balanceLoading || statsLoading || transactionsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>

        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">안녕하세요, {user?.user_metadata?.name || user?.email?.split('@')[0] || "주우"}님! 👋</h1>
          <p className="text-muted-foreground">오늘도 좋은 하루 보내세요!</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Coins className="h-6 w-6" />
                    내 포인트
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold mb-2">{balance?.toLocaleString() || 0}</div>
                  <p className="text-purple-100">포인트</p>
                </CardContent>
              </Card>

              <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-6 w-6" />
                    이번 주 적립
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    +{stats?.totalEarned.toLocaleString() || 0}
                  </div>
                  <p className="text-muted-foreground">포인트</p>
                </CardContent>
              </Card>

              <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="h-6 w-6" />
                    이번 주 사용
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    -{stats?.totalSpent.toLocaleString() || 0}
                  </div>
                  <p className="text-muted-foreground">포인트</p>
                </CardContent>
              </Card>
            </div>

            <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  최근 활동
                </CardTitle>
                <CardDescription>최근 5개의 포인트 변동 내역</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{tx.note || tx.ruleName || "포인트 변동"}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.ruleCategory && (
                              <span className="category-badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 mr-2">
                                {tx.ruleCategory}
                              </span>
                            )}
                            {new Date(tx.createdAt).toLocaleDateString("ko-KR", {
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div
                              className={`text-xl font-bold ${
                                tx.amount > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {tx.amount > 0 ? "+" : ""}
                              {tx.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              잔액: {tx.balanceAfter.toLocaleString()}
                            </div>
                          </div>
                          {user?.role === "admin" && !tx.note?.startsWith("취소:") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                              onClick={() => handleCancel(tx.id)}
                              disabled={cancelMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Link href="/transactions">
                      <Button variant="outline" className="w-full">
                        전체 내역 보기
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>아직 활동 내역이 없습니다.</p>
                    <p className="text-sm mt-2">좋은 행동으로 포인트를 모아보세요!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
