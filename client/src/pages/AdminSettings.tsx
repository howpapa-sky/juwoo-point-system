import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Shield, User } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: users, isLoading } = trpc.admin.users.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const utils = trpc.useUtils();
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      toast.success("역할이 변경되었습니다!");
    },
    onError: (error) => {
      toast.error(error.message || "역할 변경에 실패했습니다.");
    },
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>관리자 설정을 보려면 로그인해주세요.</CardDescription>
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

  const handleToggleRole = (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmMessage = newRole === "admin" 
      ? "이 사용자를 관리자로 등록하시겠습니까?" 
      : "이 사용자의 관리자 권한을 제거하시겠습니까?";
    
    if (confirm(confirmMessage)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <div className="container py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>

        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">관리자 설정 👥</h1>
          <p className="text-muted-foreground">
            사용자 목록을 확인하고 관리자 권한을 부여하세요.
          </p>
        </div>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-500" />
              사용자 목록
            </CardTitle>
            <CardDescription>
              로그인한 모든 사용자를 확인하고 관리자 권한을 관리할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">불러오는 중...</p>
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {u.name ? u.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold">{u.name || "이름 없음"}</p>
                        <p className="text-sm text-muted-foreground">
                          {u.email || u.loginMethod || "정보 없음"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          마지막 로그인: {new Date(u.lastSignedIn).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {u.role === "admin" ? (
                        <span className="category-badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <Shield className="h-3 w-3 inline mr-1" />
                          관리자
                        </span>
                      ) : (
                        <span className="category-badge bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                          <User className="h-3 w-3 inline mr-1" />
                          일반 사용자
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant={u.role === "admin" ? "destructive" : "default"}
                        onClick={() => handleToggleRole(u.id, u.role)}
                        disabled={updateRoleMutation.isPending || u.id === user.id}
                      >
                        {u.role === "admin" ? "권한 제거" : "관리자 등록"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">사용자가 없습니다</p>
                <p className="text-sm">아직 로그인한 사용자가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle>💡 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>1. 엄마를 관리자로 등록하는 방법:</strong>
            </p>
            <p className="ml-4">
              • 엄마가 네이버 계정으로 로그인하면 위 목록에 자동으로 나타납니다
            </p>
            <p className="ml-4">
              • 엄마 계정 옆의 "관리자 등록" 버튼을 클릭하면 관리자 권한이 부여됩니다
            </p>
            <p className="mt-4">
              <strong>2. 관리자 권한:</strong>
            </p>
            <p className="ml-4">
              • 관리자는 주우의 포인트를 적립/차감할 수 있습니다
            </p>
            <p className="ml-4">
              • 구매 요청을 승인하거나 거절할 수 있습니다
            </p>
            <p className="ml-4">
              • 거래 내역을 취소할 수 있습니다
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
