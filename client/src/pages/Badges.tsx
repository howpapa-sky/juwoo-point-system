import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Award, Trophy, Star, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface BadgeData {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  points_required: number | null;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

export default function Badges() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(false);

  // 배지 목록 가져오기
  const fetchBadges = async () => {
    setLoading(true);
    
    // 모든 배지 가져오기
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('points_required', { ascending: true });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      toast.error("배지를 불러오는데 실패했습니다");
      setLoading(false);
      return;
    }

    // 사용자가 획득한 배지 가져오기
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id, unlocked_at');

    if (userBadgesError) {
      console.error('Error fetching user badges:', userBadgesError);
    }

    // 배지 데이터 합치기
    const userBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
    const userBadgeMap = new Map(userBadges?.map(ub => [ub.badge_id, ub.unlocked_at]) || []);

    const badgesWithStatus: BadgeData[] = (allBadges || []).map(badge => ({
      ...badge,
      is_unlocked: userBadgeIds.has(badge.id),
      unlocked_at: userBadgeMap.get(badge.id) || null,
    }));

    setBadges(badgesWithStatus);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBadges();
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>배지를 확인하려면 로그인해주세요.</CardDescription>
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

  const unlockedBadges = badges.filter(b => b.is_unlocked);
  const lockedBadges = badges.filter(b => !b.is_unlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
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
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Trophy className="h-10 w-10 text-yellow-500" />
            배지 컬렉션 🏆
          </h1>
          <p className="text-muted-foreground">
            획득한 배지: {unlockedBadges.length} / {badges.length}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">배지를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 획득한 배지 */}
            {unlockedBadges.length > 0 && (
              <div className="animate-slide-up">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  획득한 배지
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockedBadges.map((badge) => (
                    <Card key={badge.id} className="bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-4xl mb-2">{badge.icon}</div>
                            <CardTitle className="text-xl">{badge.name}</CardTitle>
                            <CardDescription className="mt-2">
                              {badge.description}
                            </CardDescription>
                          </div>
                          <Badge className="bg-yellow-500">획득</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="h-4 w-4" />
                            {badge.requirement}
                          </div>
                          {badge.unlocked_at && (
                            <p className="text-xs text-muted-foreground">
                              획득일: {new Date(badge.unlocked_at).toLocaleDateString('ko-KR')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 잠긴 배지 */}
            {lockedBadges.length > 0 && (
              <div className="animate-slide-up">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="h-6 w-6" />
                  잠긴 배지
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lockedBadges.map((badge) => (
                    <Card key={badge.id} className="opacity-60 hover:opacity-80 transition-opacity">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                            <CardTitle className="text-xl">{badge.name}</CardTitle>
                            <CardDescription className="mt-2">
                              {badge.description}
                            </CardDescription>
                          </div>
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Award className="h-4 w-4" />
                            {badge.requirement}
                          </div>
                          {badge.points_required && (
                            <p className="text-xs text-muted-foreground">
                              필요 포인트: {badge.points_required}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {badges.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">아직 배지가 없습니다.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
