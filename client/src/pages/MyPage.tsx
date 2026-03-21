import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, User } from "lucide-react";

export default function MyPage() {
  const { user, loading } = useSupabaseAuth();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요해!</CardTitle>
            <CardDescription>로그인하면 볼 수 있어!</CardDescription>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <User className="h-10 w-10" />
            마이페이지 👤
          </h1>
          <p className="text-muted-foreground">내 정보 확인!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>마이페이지 기능</CardTitle>
            <CardDescription>준비 중입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">이 기능은 곧 제공될 예정입니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
