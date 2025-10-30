import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: pendingPurchases, isLoading } = trpc.admin.pendingPurchases.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const utils = trpc.useUtils();
  const approveMutation = trpc.admin.approvePurchase.useMutation({
    onSuccess: () => {
      utils.admin.pendingPurchases.invalidate();
      utils.points.balance.invalidate();
      utils.points.transactions.invalidate();
      toast.success("처리되었습니다!");
    },
    onError: (error) => {
      toast.error(error.message || "처리에 실패했습니다.");
    },
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>관리자 패널을 보려면 로그인해주세요.</CardDescription>
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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>관리자만 접근할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApprove = (purchaseId: number, approved: boolean) => {
    approveMutation.mutate({ purchaseId, approved });
  };

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
          <h1 className="text-4xl font-bold mb-2">관리자 패널 ⚙️</h1>
          <p className="text-muted-foreground">구매 요청을 승인하거나 거절하세요.</p>
        </div>

        <div className="grid gap-6">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-yellow-500" />
                승인 대기 중인 구매 요청
              </CardTitle>
              <CardDescription>
                {pendingPurchases?.length || 0}개의 요청이 대기 중입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">불러오는 중...</p>
                </div>
              ) : pendingPurchases && pendingPurchases.length > 0 ? (
                <div className="space-y-4">
                  {pendingPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-lg">{purchase.itemName}</p>
                            <span className="category-badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              구매 요청
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              <span className="font-medium">요청 시간:</span>{" "}
                              {new Date(purchase.createdAt).toLocaleString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {purchase.note && (
                              <p>
                                <span className="font-medium">메모:</span> {purchase.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-red-600">
                            -{purchase.pointCost.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">포인트</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          variant="default"
                          onClick={() => handleApprove(purchase.id, true)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          승인
                        </Button>
                        <Button
                          className="flex-1"
                          variant="destructive"
                          onClick={() => handleApprove(purchase.id, false)}
                          disabled={approveMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          거절
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">대기 중인 요청이 없습니다</p>
                  <p className="text-sm">모든 구매 요청이 처리되었습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle>빠른 링크</CardTitle>
              <CardDescription>다른 관리 기능으로 이동</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Link href="/points">
                <Button variant="outline" className="w-full">
                  포인트 관리
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="outline" className="w-full">
                  거래 내역
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
