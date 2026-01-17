import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Plus, Minus, Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('point_rules')
          .select('*')
          .eq('is_active', true)
          .order('category')
          .order('point_amount', { ascending: false });

        if (error) throw error;
        setRules(data || []);

        // Fetch current points
        const { data: profileData, error: profileError } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        if (profileError) throw profileError;
        setCurrentPoints(profileData?.current_points || 0);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleApplyRule = async (ruleId: number, ruleName: string, amount: number) => {
    setApplying(true);
    try {
      // 1. Get current balance
      const { data: profileData, error: profileError } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      if (profileError) throw profileError;

      const currentBalance = profileData?.current_points || 0;
      const newBalance = currentBalance + amount;

      // 2. Insert transaction
      const { error: txError } = await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: ruleId,
          amount: amount,
          balance_after: newBalance,
          note: ruleName,
          created_by: 1, // 시스템/관리자
        });

      if (txError) throw txError;

      // 3. Update balance
      const { error: updateError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      if (updateError) throw updateError;

      setCurrentPoints(newBalance);
      toast.success("포인트가 적용되었습니다!");
    } catch (error: any) {
      console.error('Error applying rule:', error);
      toast.error('포인트 적용에 실패했습니다.');
    } finally {
      setApplying(false);
    }
  };

  const handleManualAdjustment = async () => {
    const amount = parseInt(manualAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('유효한 금액을 입력해주세요.');
      return;
    }

    if (!manualNote.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    setApplying(true);
    try {
      const finalAmount = manualType === "add" ? amount : -amount;
      const newBalance = currentPoints + finalAmount;

      // 1. Insert transaction
      const { error: txError } = await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null, // 수기 조정
          amount: finalAmount,
          balance_after: newBalance,
          note: manualNote.trim(),
          created_by: 1, // 시스템/관리자
        });

      if (txError) throw txError;

      // 2. Update balance
      const { error: updateError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      if (updateError) throw updateError;

      setCurrentPoints(newBalance);
      toast.success(`포인트가 ${manualType === "add" ? "적립" : "차감"}되었습니다!`);
      setShowManualDialog(false);
      setManualAmount("");
      setManualNote("");
    } catch (error: any) {
      console.error('Error manual adjustment:', error);
      toast.error('포인트 조정에 실패했습니다.');
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
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>포인트 관리를 하려면 로그인해주세요.</CardDescription>
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
  ];

  const filteredRules = rules.filter(
    (rule) => selectedCategory === "all" || rule.category === selectedCategory
  );

  const positiveRules = filteredRules.filter((rule) => rule.point_amount > 0);
  const negativeRules = filteredRules.filter((rule) => rule.point_amount < 0);

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
                포인트 관리
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </h1>
              <p className="text-muted-foreground">주우의 행동에 따라 포인트를 적립하거나 차감하세요.</p>
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
                      <div className="text-xs text-muted-foreground font-medium">현재 포인트</div>
                      <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {currentPoints.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 수기 조정 버튼 */}
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
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md"
                  onClick={() => openManualDialog("subtract")}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  수기 차감
                </Button>
              </div>
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
                    포인트 적립
                  </CardTitle>
                  <CardDescription>좋은 행동을 했을 때 포인트를 적립하세요.</CardDescription>
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
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-md">
                            {rule.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                            +{rule.point_amount.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                            onClick={() => handleApplyRule(rule.id, rule.name, rule.point_amount)}
                            disabled={applying}
                          >
                            적립
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 포인트 차감 */}
            {negativeRules.length > 0 && (
              <Card className="border-2 border-red-200 dark:border-red-900 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <Minus className="h-5 w-5 text-white" />
                    </div>
                    포인트 차감
                  </CardTitle>
                  <CardDescription>나쁜 행동을 했을 때 포인트를 차감하세요.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {negativeRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="group relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-red-400 dark:hover:border-red-600 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="mb-4">
                          <h3 className="font-semibold text-base mb-1 line-clamp-1">{rule.name}</h3>
                          {rule.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{rule.description}</p>
                          )}
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
                            {rule.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl font-bold text-red-600 dark:text-red-500">
                            {rule.point_amount.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white shadow-md"
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
                  포인트 수기 적립
                </>
              ) : (
                <>
                  <div className="p-2 bg-red-500 rounded-lg">
                    <Minus className="h-5 w-5 text-white" />
                  </div>
                  포인트 수기 차감
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {manualType === "add"
                ? "포인트를 수동으로 적립합니다."
                : "포인트를 수동으로 차감합니다."}
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
                <div className="text-sm text-muted-foreground font-medium">현재 포인트</div>
                <div className="text-xl font-bold">{currentPoints.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground font-medium">변경 후</div>
                <div className={`text-xl font-bold ${
                  manualType === "add" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
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
                : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"}
            >
              {applying ? "처리 중..." : (manualType === "add" ? "적립" : "차감")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
