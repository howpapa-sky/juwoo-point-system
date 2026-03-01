import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Target, Plus, Check, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Goal {
  id: number;
  title: string;
  target_points: number;
  current_points: number;
  status: 'active' | 'completed' | 'cancelled';
  completed_at: string | null;
  created_at: string;
}

export default function Goals() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    target_points: 0,
  });

  // 목표 목록 가져오기
  const fetchGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) console.error('Error fetching goals:', error);
      toast.error("목표를 불러오지 못했어요");
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals();
    }
  }, [isAuthenticated]);

  // 새 목표 추가
  const handleAddGoal = async () => {
    if (!newGoal.title || newGoal.target_points <= 0) {
      toast.error("제목과 목표 포인트를 입력해주세요");
      return;
    }

    const { error } = await supabase
      .from('goals')
      .insert({
        juwoo_id: 1,
        title: newGoal.title,
        target_points: newGoal.target_points,
        current_points: 0,
        status: 'active',
      });

    if (error) {
      if (import.meta.env.DEV) console.error('Error adding goal:', error);
      toast.error("목표 추가가 잘 안 됐어요");
    } else {
      toast.success("새 목표가 추가되었습니다!");
      setDialogOpen(false);
      setNewGoal({ title: "", target_points: 0 });
      fetchGoals();
    }
  };

  // 목표 달성 처리
  const handleCompleteGoal = async (goalId: number) => {
    const { error } = await supabase
      .from('goals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', goalId);

    if (error) {
      if (import.meta.env.DEV) console.error('Error completing goal:', error);
      toast.error("목표 달성 처리가 잘 안 됐어요");
    } else {
      toast.success("🎉 목표를 달성했습니다!");
      fetchGoals();
    }
  };

  // 진행률 업데이트
  const handleUpdateProgress = async (goalId: number, progress: number) => {
    const { error } = await supabase
      .from('goals')
      .update({ current_points: progress })
      .eq('id', goalId);

    if (error) {
      if (import.meta.env.DEV) console.error('Error updating progress:', error);
      toast.error("진행률 업데이트가 잘 안 됐어요");
    } else {
      toast.success("진행률이 업데이트되었습니다");
      fetchGoals();
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>목표를 설정하려면 로그인해주세요.</CardDescription>
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

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Target className="h-10 w-10" />
              목표 설정 🎯
            </h1>
            <p className="text-muted-foreground">나만의 목표를 설정하고 달성해보세요!</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                새 목표 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 목표 추가</DialogTitle>
                <DialogDescription>
                  달성하고 싶은 목표를 설정하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">목표 제목</Label>
                  <Input
                    id="title"
                    placeholder="예: 닌텐도 구매하기"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="target_points">목표 포인트</Label>
                  <Input
                    id="target_points"
                    type="number"
                    placeholder="1000"
                    value={newGoal.target_points || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, target_points: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddGoal}>추가하기</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">목표를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 진행 중인 목표 */}
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6" />
                진행 중인 목표
              </h2>
              {activeGoals.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">진행 중인 목표가 없습니다.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      새 목표를 추가해보세요!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGoals.map((goal) => {
                    const progressPercent = (goal.current_points / goal.target_points) * 100;

                    return (
                      <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-xl">{goal.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>진행률</span>
                              <span className="font-medium">
                                {goal.current_points.toLocaleString()} / {goal.target_points.toLocaleString()} 포인트
                              </span>
                            </div>
                            <Progress value={Math.min(progressPercent, 100)} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">
                              {progressPercent.toFixed(1)}%
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                const newProgress = prompt(
                                  `현재 진행률: ${goal.current_points}\n새로운 진행률을 입력하세요:`,
                                  goal.current_points.toString()
                                );
                                if (newProgress !== null) {
                                  handleUpdateProgress(goal.id, parseInt(newProgress) || 0);
                                }
                              }}
                            >
                              진행률 업데이트
                            </Button>
                            {progressPercent >= 100 && (
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => handleCompleteGoal(goal.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                달성 완료
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 달성한 목표 */}
            {completedGoals.length > 0 && (
              <div className="animate-slide-up">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  달성한 목표
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedGoals.map((goal) => (
                    <Card key={goal.id} className="bg-gradient-to-br from-yellow-50 to-amber-50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            {goal.title}
                          </CardTitle>
                          <Badge className="bg-yellow-500">완료</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>목표 포인트</span>
                            <span className="font-medium">{goal.target_points.toLocaleString()} 포인트</span>
                          </div>
                          {goal.completed_at && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="h-4 w-4" />
                              달성일: {new Date(goal.completed_at).toLocaleDateString('ko-KR')}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
