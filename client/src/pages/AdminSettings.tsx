import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Cog } from "lucide-react";

export default function AdminSettings() {
  const { user, loading } = useSupabaseAuth();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>관리자 설정을 사용하려면 로그인해주세요.</CardDescription>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
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
            <Cog className="h-10 w-10" />
            관리자 설정 ⚙️
          </h1>
          <p className="text-muted-foreground">시스템 설정을 관리하세요!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>설정 기능</CardTitle>
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
