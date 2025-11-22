import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins } from "lucide-react";

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
          note: ruleName,
          created_by: null,
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
          rule_id: null,
          amount: finalAmount,
          note: `[수기${manualType === "add" ? "적립" : "차감"}] ${manualNote.trim()}`,
          created_by: null,
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">포인트 관리 ⚙️</h1>
              <p className="text-muted-foreground">주우의 행동에 따라 포인트를 적립하거나 차감하세요.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg">
                <Coins className="h-5 w-5" />
                <div className="text-right">
                  <div className="text-xs opacity-90">현재 포인트</div>
                  <div className="text-2xl font-bold">{currentPoints.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                  onClick={() => openManualDialog("add")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  수기 적립
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                  onClick={() => openManualDialog("subtract")}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  수기 차감
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? "전체" : cat}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">규칙을 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {positiveRules.length > 0 && (
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Plus className="h-6 w-6" />
                    포인트 적립 (긍정적 행동)
                  </CardTitle>
                  <CardDescription>좋은 행동을 했을 때 포인트를 적립하세요.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {positiveRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="mb-3">
                          <h3 className="font-semibold mb-1">{rule.name}</h3>
                          {rule.description && (
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          )}
                          <span className="category-badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 mt-2">
                            {rule.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-green-600">
                            +{rule.point_amount.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
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

            {negativeRules.length > 0 && (
              <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Minus className="h-6 w-6" />
                    포인트 차감 (부정적 행동)
                  </CardTitle>
                  <CardDescription>나쁜 행동을 했을 때 포인트를 차감하세요.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {negativeRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="mb-3">
                          <h3 className="font-semibold mb-1">{rule.name}</h3>
                          {rule.description && (
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          )}
                          <span className="category-badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 mt-2">
                            {rule.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-red-600">
                            {rule.point_amount.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {manualType === "add" ? "포인트 수기 적립" : "포인트 수기 차감"}
            </DialogTitle>
            <DialogDescription>
              {manualType === "add"
                ? "포인트를 수동으로 적립합니다."
                : "포인트를 수동으로 차감합니다."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount">금액</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="note">내용</Label>
              <Input
                id="note"
                placeholder="예: 특별 보너스"
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Coins className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">현재 포인트</div>
                <div className="font-semibold">{currentPoints.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">변경 후</div>
                <div className={`font-bold ${
                  manualType === "add" ? "text-green-600" : "text-red-600"
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
              className={manualType === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {applying ? "처리 중..." : (manualType === "add" ? "적립" : "차감")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
