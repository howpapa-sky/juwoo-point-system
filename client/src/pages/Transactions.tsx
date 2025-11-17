import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Receipt, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Transactions() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [limit, setLimit] = useState(50);
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
  const { data: transactions, isLoading } = trpc.points.transactions.useQuery(
    { limit },
    { enabled: isAuthenticated }
  );

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>거래 내역을 보려면 로그인해주세요.</CardDescription>
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
          <h1 className="text-4xl font-bold mb-2">거래 내역 📋</h1>
          <p className="text-muted-foreground">모든 포인트 변동 내역을 확인하세요.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">거래 내역을 불러오는 중...</p>
          </div>
        ) : (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-6 w-6" />
                전체 거래 내역
              </CardTitle>
              <CardDescription>
                최근 {transactions?.length || 0}개의 거래 내역
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{tx.note || tx.ruleName || "포인트 변동"}</p>
                          {tx.ruleCategory && (
                            <span className="category-badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              {tx.ruleCategory}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
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
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancel(tx.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {transactions.length >= limit && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setLimit(limit + 50)}
                    >
                      더 보기
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">거래 내역이 없습니다</p>
                  <p className="text-sm">좋은 행동으로 포인트를 모아보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
