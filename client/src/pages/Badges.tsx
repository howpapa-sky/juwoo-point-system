import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Award, Lock } from "lucide-react";
import { Link } from "wouter";

export default function Badges() {
  const { user, loading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const { data: badges, isLoading: badgesLoading } = trpc.badges.all.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: userBadges, isLoading: userBadgesLoading } = trpc.badges.userBadges.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🔒 로그인 필요</CardTitle>
            <CardDescription>배지를 보려면 로그인이 필요합니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>로그인하기</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const earnedBadgeIds = new Set(userBadges?.map((ub: any) => ub.badge_id) || []);
  const badgesByCategory = (badges || []).reduce((acc: any, badge: any) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🏆 배지 컬렉션
          </h1>
          <p className="text-gray-600">
            {userBadges?.length || 0} / {badges?.length || 0} 배지 획득
          </p>
        </div>

        {/* Back Button */}
        <Button asChild variant="outline">
          <Link href="/">← 홈으로 돌아가기</Link>
        </Button>

        {/* Badges by Category */}
        {badgesLoading || userBadgesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">배지를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(badgesByCategory).map(([category, categoryBadges]: [string, any]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryBadges.map((badge: any) => {
                    const isEarned = earnedBadgeIds.has(badge.id);
                    return (
                      <Card
                        key={badge.id}
                        className={`${
                          isEarned
                            ? "border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50"
                            : "opacity-60 grayscale"
                        } transition-all duration-300 hover:scale-105`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="text-5xl">{badge.icon}</div>
                            {isEarned ? (
                              <Award className="h-6 w-6 text-yellow-600" />
                            ) : (
                              <Lock className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <CardTitle className="text-xl">{badge.name}</CardTitle>
                          <CardDescription>{badge.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-gray-600">
                            {isEarned ? (
                              <span className="text-green-600 font-semibold">✓ 획득 완료</span>
                            ) : (
                              <span>조건: {badge.requirement}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {badges && badges.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">아직 배지가 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
