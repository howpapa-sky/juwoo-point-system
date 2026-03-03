import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  BarChart3,
  Brain,
  Flame,
  Star,
  Heart,
  Clock,
  Shield,
  Award,
  BookOpen,
  Target,
  Lightbulb,
  Flower2,
} from 'lucide-react';
import { useXP, type EnglishProfile } from '@/hooks/useXP';
import { useSRS } from '@/hooks/useSRS';
import { useSessionLog } from '@/hooks/useSessionLog';
import { useBadgeChecker } from '@/hooks/useBadgeChecker';
import { ENGLISH_BADGES } from '@/data/englishBadges';
import { getLevelFromXP, SRS_BOX_META } from '@/lib/englishConstants';

interface SessionData {
  id: number;
  session_type: string;
  total_items: number | null;
  correct_count: number | null;
  dont_know_count: number | null;
  guessing_count: number | null;
  xp_earned: number | null;
  coins_earned: number | null;
  started_at: string;
  completed_at: string | null;
}

export default function ParentDashboard() {
  const { profile, loading: xpLoading } = useXP();
  const { gardenStats, totalWords, loading: srsLoading } = useSRS();
  const { getRecentSessions } = useSessionLog();
  const { earnedBadges, loading: badgeLoading } = useBadgeChecker();

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      setSessionsLoading(true);
      const data = await getRecentSessions(7);
      setSessions(data as SessionData[]);
      setSessionsLoading(false);
    }
    loadSessions();
  }, [getRecentSessions]);

  const loading = xpLoading || srsLoading || sessionsLoading || badgeLoading;

  // Computed analytics
  const analytics = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalItems: 0,
        totalCorrect: 0,
        totalDontKnow: 0,
        totalGuessing: 0,
        accuracy: 0,
        dontKnowRate: 0,
        guessingRate: 0,
        avgItemsPerSession: 0,
        totalXPEarned: 0,
        totalCoinsEarned: 0,
        sessionTypes: {} as Record<string, number>,
      };
    }

    const totalSessions = sessions.length;
    const totalItems = sessions.reduce((sum, s) => sum + (s.total_items ?? 0), 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + (s.correct_count ?? 0), 0);
    const totalDontKnow = sessions.reduce((sum, s) => sum + (s.dont_know_count ?? 0), 0);
    const totalGuessing = sessions.reduce((sum, s) => sum + (s.guessing_count ?? 0), 0);
    const totalXPEarned = sessions.reduce((sum, s) => sum + (s.xp_earned ?? 0), 0);
    const totalCoinsEarned = sessions.reduce((sum, s) => sum + (s.coins_earned ?? 0), 0);

    const accuracy = totalItems > 0 ? Math.round((totalCorrect / totalItems) * 100) : 0;
    const dontKnowRate = totalItems > 0 ? Math.round((totalDontKnow / totalItems) * 100) : 0;
    const guessingRate = totalItems > 0 ? Math.round((totalGuessing / totalItems) * 100) : 0;
    const avgItemsPerSession = totalSessions > 0 ? Math.round(totalItems / totalSessions) : 0;

    const sessionTypes: Record<string, number> = {};
    sessions.forEach((s) => {
      sessionTypes[s.session_type] = (sessionTypes[s.session_type] ?? 0) + 1;
    });

    return {
      totalSessions,
      totalItems,
      totalCorrect,
      totalDontKnow,
      totalGuessing,
      accuracy,
      dontKnowRate,
      guessingRate,
      avgItemsPerSession,
      totalXPEarned,
      totalCoinsEarned,
      sessionTypes,
    };
  }, [sessions]);

  // Insights
  const insights = useMemo(() => {
    const list: { icon: React.ReactNode; text: string; color: string }[] = [];

    const streak = profile?.current_streak ?? 0;
    if (streak >= 7) {
      list.push({
        icon: <Flame className="h-5 w-5" />,
        text: `${streak}일 연속 학습 중이에요! 대단한 끈기예요!`,
        color: 'text-orange-600 bg-orange-50',
      });
    } else if (streak >= 3) {
      list.push({
        icon: <Flame className="h-5 w-5" />,
        text: `${streak}일 연속 학습 중이에요!`,
        color: 'text-orange-600 bg-orange-50',
      });
    }

    if (analytics.dontKnowRate >= 30) {
      list.push({
        icon: <Heart className="h-5 w-5" />,
        text: '주우가 모르는 것을 솔직하게 표현하고 있어요! 이건 정말 좋은 학습 태도예요.',
        color: 'text-pink-600 bg-pink-50',
      });
    } else if (analytics.dontKnowRate >= 10) {
      list.push({
        icon: <Heart className="h-5 w-5" />,
        text: '적절하게 "모르겠어요"를 사용하고 있어요.',
        color: 'text-pink-600 bg-pink-50',
      });
    }

    if (analytics.accuracy >= 80) {
      list.push({
        icon: <Target className="h-5 w-5" />,
        text: `정답률이 ${analytics.accuracy}%로 매우 높아요! 잘 이해하고 있어요.`,
        color: 'text-green-600 bg-green-50',
      });
    } else if (analytics.accuracy >= 50) {
      list.push({
        icon: <Target className="h-5 w-5" />,
        text: `정답률이 ${analytics.accuracy}%예요. 꾸준히 성장하고 있어요.`,
        color: 'text-blue-600 bg-blue-50',
      });
    }

    if (analytics.guessingRate <= 5 && analytics.totalItems > 10) {
      list.push({
        icon: <Shield className="h-5 w-5" />,
        text: '찍기를 거의 하지 않아요. 문제를 꼼꼼히 읽고 있어요!',
        color: 'text-indigo-600 bg-indigo-50',
      });
    } else if (analytics.guessingRate > 15) {
      list.push({
        icon: <Clock className="h-5 w-5" />,
        text: '가끔 빨리 답을 고르는 경향이 있어요. 천천히 읽어볼 수 있도록 격려해주세요.',
        color: 'text-slate-600 bg-slate-50',
      });
    }

    const masteredCount = (gardenStats[4] ?? 0) + (gardenStats[5] ?? 0);
    if (masteredCount >= 10) {
      list.push({
        icon: <Flower2 className="h-5 w-5" />,
        text: `단어 정원에 ${masteredCount}개의 꽃과 별이 있어요! SRS 복습이 효과를 보고 있어요.`,
        color: 'text-emerald-600 bg-emerald-50',
      });
    }

    if (list.length === 0) {
      list.push({
        icon: <Lightbulb className="h-5 w-5" />,
        text: '아직 데이터가 충분하지 않아요. 학습을 계속하면 더 정확한 분석을 제공할 수 있어요.',
        color: 'text-amber-600 bg-amber-50',
      });
    }

    return list;
  }, [profile, analytics, gardenStats]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-slate-500 border-t-transparent rounded-full"
        />
        <p className="text-slate-500 mt-4 text-lg font-medium">대시보드를 불러오는 중...</p>
      </div>
    );
  }

  const currentLevel = profile ? getLevelFromXP(profile.total_xp) : null;
  const badgeCount = earnedBadges.length;
  const totalBadges = ENGLISH_BADGES.length;

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-slate-50">
      <div className="px-4 pt-4 space-y-5 max-w-2xl mx-auto">
        {/* 뒤로가기 */}
        <Link href="/english-learning">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            영어 학습
          </Button>
        </Link>

        {/* 타이틀 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-slate-800 mb-1">부모님 대시보드</h1>
          <p className="text-slate-500">주우의 학습 분석과 인사이트</p>
        </motion.div>

        {/* XP / 레벨 / 스트릭 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl rounded-2xl">
            <CardContent className="p-5">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <Star className="h-5 w-5 mx-auto mb-1 text-amber-300" />
                  <div className="text-2xl font-black">Lv.{currentLevel?.level ?? 1}</div>
                  <p className="text-xs text-white/70">{currentLevel?.title ?? ''}</p>
                </div>
                <div>
                  <BarChart3 className="h-5 w-5 mx-auto mb-1 text-cyan-300" />
                  <div className="text-2xl font-black">{profile?.total_xp ?? 0}</div>
                  <p className="text-xs text-white/70">총 XP</p>
                </div>
                <div>
                  <Flame className="h-5 w-5 mx-auto mb-1 text-orange-300" />
                  <div className="text-2xl font-black">{profile?.current_streak ?? 0}</div>
                  <p className="text-xs text-white/70">연속 학습</p>
                </div>
                <div>
                  <Award className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
                  <div className="text-2xl font-black">{profile?.longest_streak ?? 0}</div>
                  <p className="text-xs text-white/70">최고 기록</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 인사이트 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            학습 인사이트
          </h2>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <Card key={idx} className="border-0 shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${insight.color}`}>
                      {insight.icon}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{insight.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* 주간 학습 요약 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            주간 학습 요약
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">학습 세션</p>
                <div className="text-3xl font-black text-slate-800">{analytics.totalSessions}회</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">학습 문항</p>
                <div className="text-3xl font-black text-slate-800">{analytics.totalItems}개</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">획득 XP</p>
                <div className="text-3xl font-black text-indigo-600">{analytics.totalXPEarned}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <p className="text-sm text-slate-500">획득 코인</p>
                <div className="text-3xl font-black text-amber-600">{analytics.totalCoinsEarned}</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* 행동 분석 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            행동 분석
          </h2>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4 space-y-4">
              {/* 정답률 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">정답률</span>
                  <span className="font-bold text-slate-800">{analytics.accuracy}%</span>
                </div>
                <Progress value={analytics.accuracy} className="h-2 [&>div]:bg-green-500" />
              </div>

              {/* 모르겠어요 사용률 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">&quot;모르겠어요&quot; 사용률 (솔직함 지표)</span>
                  <span className="font-bold text-pink-600">{analytics.dontKnowRate}%</span>
                </div>
                <Progress value={analytics.dontKnowRate} className="h-2 [&>div]:bg-pink-400" />
                <p className="text-xs text-slate-400 mt-1">
                  높을수록 솔직하게 학습하고 있다는 의미예요
                </p>
              </div>

              {/* 찍기 감지율 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">찍기 감지율</span>
                  <span className="font-bold text-slate-800">{analytics.guessingRate}%</span>
                </div>
                <Progress value={analytics.guessingRate} className="h-2 [&>div]:bg-slate-400" />
                <p className="text-xs text-slate-400 mt-1">
                  낮을수록 문제를 꼼꼼히 읽고 있다는 의미예요
                </p>
              </div>

              {/* 평균 문항 수 */}
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">세션당 평균 문항</span>
                  <span className="font-bold text-slate-800">{analytics.avgItemsPerSession}개</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 단어 정원 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Flower2 className="h-5 w-5 text-green-500" />
            SRS 단어 정원 현황
          </h2>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600">전체 {totalWords}개 단어</span>
                <span className="text-sm font-bold text-green-600">
                  마스터 {(gardenStats[4] ?? 0) + (gardenStats[5] ?? 0)}개
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((box) => (
                  <div key={box} className="text-center">
                    <div className="text-2xl mb-1">{SRS_BOX_META[box].icon}</div>
                    <div className="text-lg font-black text-slate-800">{gardenStats[box] ?? 0}</div>
                    <div className="text-xs text-slate-500">{SRS_BOX_META[box].label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 배지 진행 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            배지 수집
          </h2>
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">획득한 배지</span>
                <span className="font-bold text-amber-600">{badgeCount} / {totalBadges}</span>
              </div>
              <Progress value={totalBadges > 0 ? Math.round((badgeCount / totalBadges) * 100) : 0} className="h-3 [&>div]:bg-amber-400 mb-3" />

              {badgeCount > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.slice(0, 10).map((badge) => {
                    const def = ENGLISH_BADGES.find((b) => b.id === badge.badge_id);
                    if (!def) return null;
                    return (
                      <div
                        key={badge.badge_id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full"
                        title={def.description}
                      >
                        <span className="text-lg">{def.icon}</span>
                        <span className="text-xs font-bold text-amber-700">{def.name}</span>
                      </div>
                    );
                  })}
                  {badgeCount > 10 && (
                    <span className="text-xs text-slate-400 self-center">+{badgeCount - 10}개 더</span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400">아직 획득한 배지가 없어요</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 세션 유형별 */}
        {Object.keys(analytics.sessionTypes).length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              학습 유형 분포
            </h2>
            <Card className="border-0 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {Object.entries(analytics.sessionTypes).map(([type, count]) => {
                    const labels: Record<string, string> = {
                      review: '복습',
                      quiz: '퀴즈',
                      pronunciation: '발음 연습',
                      story: '스토리',
                      flashcard: '플래시카드',
                    };
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{labels[type] ?? type}</span>
                        <span className="font-bold text-slate-800">{count}회</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
