import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Plus, Minus, Coins, Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WORLDVIEW } from "@/lib/designTokens";

interface PointRule {
  id: number;
  name: string;
  description: string | null;
  category: string;
  point_amount: number;
  is_active: boolean;
}

export default function PointsManage() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [rules, setRules] = useState<PointRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [manualAmount, setManualAmount] = useState<string>("");
  const [manualNote, setManualNote] = useState<string>("");
  const [manualType, setManualType] = useState<"add" | "subtract">("add");

  // Auth-based role check (Supabase Auth 역할 분리)
  const [userRole, setUserRole] = useState<'child' | 'parent'>('child');

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('juwoo_profile')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            if (import.meta.env.DEV) console.error('Error fetching user role:', error);
          }
          setUserRole(data?.role ?? 'child');
        });
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const initialize = async () => {
      setLoading(true);
      try {
        // Fetch rules
        const { data, error } = await supabase
          .from('point_rules')
          .select('*')
          .eq('is_active', true)
          .order('category')
          .order('point_amount', { ascending: false });

        if (error) {
          if (import.meta.env.DEV) console.error('Error fetching rules:', error);
          toast.error('규칙을 불러오지 못했어요.');
          return;
        }
        setRules(data ?? []);

        // Fetch current points
        const { data: profileData, error: profileError } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        if (profileError) {
          if (import.meta.env.DEV) console.error('Error fetching profile:', profileError);
          toast.error('프로필을 불러오지 못했어요.');
          return;
        }
        setCurrentPoints(profileData?.current_points ?? 0);
      } catch (error: any) {
        if (import.meta.env.DEV) console.error('Error fetching data:', error);
        toast.error('데이터를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [isAuthenticated]);

  const handleApplyRule = async (ruleId: number, ruleName: string, amount: number) => {
    setApplying(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      if (profileError) {
        if (import.meta.env.DEV) console.error('Error fetching profile:', profileError);
        toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        return;
      }

      const currentBalance = profileData?.current_points ?? 0;
      const newBalance = currentBalance + amount;

      // 1. 거래 내역 기록
      const { error: txError } = await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: ruleId,
          amount: amount,
          balance_after: newBalance,
          note: ruleName,
          created_by: 1,
        });

      if (txError) {
        if (import.meta.env.DEV) console.error('Error inserting transaction:', txError);
        toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        return;
      }

      // 2. 포인트 업데이트
      const { error: updateError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      if (updateError) {
        if (import.meta.env.DEV) console.error('Error updating profile:', updateError);
        toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        return;
      }

      setCurrentPoints(newBalance);
      toast.success(`${WORLDVIEW.points}가 적용되었어요!`);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Error applying rule:', error);
      toast.error('포인트 적용이 잘 안 됐어요.');
    } finally {
      setApplying(false);
    }
  };

  const handleManualAdjustment = async () => {
    const amount = parseInt(manualAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('유효한 금액을 넣어줘!');
      return;
    }

    if (!manualNote.trim()) {
      toast.error('내용을 넣어줘!');
      return;
    }

    setApplying(true);
    try {
      const finalAmount = manualType === "add" ? amount : -amount;
      const newBalance = currentPoints + finalAmount;

      // 1. 거래 내역 기록
      const { error: txError } = await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          amount: finalAmount,
          balance_after: newBalance,
          note: manualNote.trim(),
          created_by: 1,
        });

      if (txError) {
        if (import.meta.env.DEV) console.error('Error inserting transaction:', txError);
        toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        return;
      }

      // 2. 포인트 업데이트
      const { error: updateError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      if (updateError) {
        if (import.meta.env.DEV) console.error('Error updating profile:', updateError);
        // 롤백 불가 (tx는 이미 기록됨) - 사용자에게 알림
        toast.error('잠깐, 문제가 생겼어! 다시 해보자');
        return;
      }

      setCurrentPoints(newBalance);
      toast.success(`${WORLDVIEW.points}가 ${manualType === "add" ? "적립" : "차감"}되었어요!`);
      setShowManualDialog(false);
      setManualAmount("");
      setManualNote("");
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Error manual adjustment:', error);
      toast.error('포인트 조정이 잘 안 됐어요.');
    } finally {
      setApplying(false);
    }
  };

  const handleResetPoints = async () => {
    setApplying(true);
    try {
      // 1. 의존 테이블부터 삭제 (FK 순서)
      const { error: e1 } = await supabase.from('goal_deposits').delete().neq('id', 0);
      if (e1) { if (import.meta.env.DEV) console.error('Error deleting goal_deposits:', e1); throw e1; }

      const { error: e2 } = await supabase.from('saving_goals').delete().eq('juwoo_id', 1);
      if (e2) { if (import.meta.env.DEV) console.error('Error deleting saving_goals:', e2); throw e2; }

      const { error: e3 } = await supabase.from('interest_history').delete().neq('id', 0);
      if (e3) { if (import.meta.env.DEV) console.error('Error deleting interest_history:', e3); throw e3; }

      const { error: e4 } = await supabase.from('seeds').delete().eq('juwoo_id', 1);
      if (e4) { if (import.meta.env.DEV) console.error('Error deleting seeds:', e4); throw e4; }

      const { error: e5 } = await supabase.from('purchases').delete().neq('id', 0);
      if (e5) { if (import.meta.env.DEV) console.error('Error deleting purchases:', e5); throw e5; }

      const { error: e6 } = await supabase.from('point_transactions').delete().eq('juwoo_id', 1);
      if (e6) { if (import.meta.env.DEV) console.error('Error deleting point_transactions:', e6); throw e6; }

      // 2. 금고 잔액 초기화
      const { error: e7 } = await supabase.from('savings_account')
        .update({ balance: 0, last_interest_date: null })
        .eq('juwoo_id', 1);
      if (e7) { if (import.meta.env.DEV) console.error('Error resetting savings_account:', e7); throw e7; }

      // 3. 지갑 잔액 초기화
      const { error: e8 } = await supabase.from('juwoo_profile')
        .update({ current_points: 0 })
        .eq('id', 1);
      if (e8) { if (import.meta.env.DEV) console.error('Error resetting juwoo_profile:', e8); throw e8; }

      setCurrentPoints(0);
      toast.success("모든 포인트와 투자/저축 데이터가 초기화되었어요!");
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error resetting points:', error);
      toast.error('초기화가 잘 안 됐어요. 다시 해볼까?');
    } finally {
      setApplying(false);
    }
  };

  const openManualDialog = (type: "add" | "subtract") => {
    setManualType(type);
    setShowManualDialog(true);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
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

  const categories = [
    "all",
    "생활습관",
    "운동건강",
    "학습독서",
    "예의태도",
    "집안일",
    "거짓말태도",
    "시간약속",
    "생활미준수",
    "물건관리",
    "sleep",
    "meal",
    "routine",
  ];

  const filteredRules = rules.filter(
    (rule) => selectedCategory === "all" || rule.category === selectedCategory
  );

  const positiveRules = filteredRules.filter((rule) => rule.point_amount > 0);
  const negativeRules = filteredRules.filter((rule) => rule.point_amount < 0);

  const isParent = userRole === 'parent';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <div className="container max-w-7xl py-6 md:py-10">
        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              홈으로
            </Button>
          </Link>
        </div>

        {/* 타이틀 & 현재 포인트 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                {WORLDVIEW.points} 관리
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </h1>
              <p className="text-muted-foreground">주우의 행동에 따라 {WORLDVIEW.points}를 적립하거나 차감해봐!</p>
            </div>

            {/* 현재 포인트 카드 */}
            <div className="flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-[2px] shadow-xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium">{WORLDVIEW.points}</div>
                      <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {currentPoints.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 부모 역할만 수기 조정/리셋 가능 */}
              {isParent && (
                <>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
                      onClick={() => openManualDialog("add")}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      수기 적립
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md"
                      onClick={() => openManualDialog("subtract")}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      수기 차감
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                      onClick={() => handleResetPoints()}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      포인트 리셋
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "shadow-md" : ""}
            >
              {cat === "all" ? "전체" : cat}
            </Button>
          ))}
        </div>

        {/* 규칙 목록 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">규칙을 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 포인트 적립 */}
            {positiveRules.length > 0 && (
              <Card className="border-2 border-green-200 dark:border-green-900 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    {WORLDVIEW.points} 적립
                  </CardTitle>
                  <CardDescription>좋은 행동을 했을 때 {WORLDVIEW.points}를 적립해봐!</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {positiveRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="group relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-400 dark:hover:border-green-600 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="mb-4">
                          <h3 className="font-semibold text-base mb-1 line-clamp-1">{rule.name}</h3>
                          {rule.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{rule.description}</p>
                          )}
                          <span className="inline-block mt-2 px-2 py-1 text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-md">
                            {rule.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                            +{rule.point_amount.toLocaleString()}
                          </span>
                          {isParent && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                              onClick={() => handleApplyRule(rule.id, rule.name, rule.point_amount)}
                              disabled={applying}
                            >
                              적립
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 포인트 차감 — 부모 역할만 표시 */}
            {isParent && negativeRules.length > 0 && (
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
                  <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                    <div className="p-2 bg-gray-500 rounded-lg">
                      <Minus className="h-5 w-5 text-white" />
                    </div>
                    포인트 차감
                  </CardTitle>
                  <CardDescription>필요한 경우에만 차감해!</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {negativeRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="group relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="mb-4">
                          <h3 className="font-semibold text-base mb-1 line-clamp-1">{rule.name}</h3>
                          {rule.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{rule.description}</p>
                          )}
                          <span className="inline-block mt-2 px-2 py-1 text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 rounded-md">
                            {rule.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl font-bold text-gray-600 dark:text-gray-500">
                            {rule.point_amount.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            className="bg-gray-600 hover:bg-gray-700 text-white shadow-md"
                            onClick={() => handleApplyRule(rule.id, rule.name, rule.point_amount)}
                            disabled={applying}
                          >
                            차감
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* 수기 조정 Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {manualType === "add" ? (
                <>
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  {WORLDVIEW.points} 수기 적립
                </>
              ) : (
                <>
                  <div className="p-2 bg-gray-500 rounded-lg">
                    <Minus className="h-5 w-5 text-white" />
                  </div>
                  {WORLDVIEW.points} 수기 차감
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {manualType === "add"
                ? `${WORLDVIEW.points}를 수동으로 적립해!`
                : `${WORLDVIEW.points}를 수동으로 차감해!`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount" className="text-base font-semibold">금액</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="mt-2 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="note" className="text-base font-semibold">내용</Label>
              <Input
                id="note"
                placeholder="예: 특별 보너스"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <Coins className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground font-medium">{WORLDVIEW.points}</div>
                <div className="text-xl font-bold">{currentPoints.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground font-medium">변경 후</div>
                <div className={`text-xl font-bold ${
                  manualType === "add" ? "text-green-600 dark:text-green-500" : "text-gray-600 dark:text-gray-500"
                }`}>
                  {manualAmount && !isNaN(parseInt(manualAmount))
                    ? (currentPoints + (manualType === "add" ? parseInt(manualAmount) : -parseInt(manualAmount))).toLocaleString()
                    : currentPoints.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualDialog(false)}>
              취소
            </Button>
            <Button
              onClick={handleManualAdjustment}
              disabled={applying}
              className={manualType === "add"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"}
            >
              {applying ? "처리 중..." : (manualType === "add" ? "적립" : "차감")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
