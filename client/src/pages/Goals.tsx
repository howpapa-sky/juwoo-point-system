import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Target, Plus, Trash2, Trophy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Goals() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalPoints, setNewGoalPoints] = useState("");

  const { data: goals, isLoading } = trpc.goals.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: profile } = trpc.juwoo.profile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();

  const createGoalMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      toast.success("목표가 생성되었습니다! 🎯");
      setIsDialogOpen(false);
      setNewGoalTitle("");
      setNewGoalPoints("");
      utils.goals.list.invalidate();
    },
    onError: (error) => {
      toast.error("목표 생성 실패", {
        description: error.message,
      });
    },
  });

  const deleteGoalMutation = trpc.goals.delete.useMutation({
    onSuccess: () => {
      toast.success("목표가 삭제되었습니다");
      utils.goals.list.invalidate();
    },
    onError: (error) => {
      toast.error("목표 삭제 실패", {
        description: error.message,
      });
    },
  });

  const handleCreateGoal = () => {
    const points = parseInt(newGoalPoints);
    if (!newGoalTitle.trim()) {
      toast.error("목표 제목을 입력해주세요");
      return;
    }
    if (isNaN(points) || points <= 0) {
      toast.error("유효한 포인트를 입력해주세요");
      return;
    }

    createGoalMutation.mutate({
      title: newGoalTitle,
      targetPoints: points,
    });
  };

  const handleDeleteGoal = (goalId: number) => {
    if (confirm("정말로 이 목표를 삭제하시겠습니까?")) {
      deleteGoalMutation.mutate({ goalId });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>목표 설정 기능을 사용하려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>로그인하고 시작하기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPoints = profile?.current_points || 0;
  const activeGoals = goals?.filter(g => g.status === 'active') || [];
  const completedGoals = goals?.filter(g => g.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Target className="h-8 w-8 text-blue-600" />
                목표 설정
              </h1>
              <p className="text-muted-foreground mt-1">
                포인트 목표를 설정하고 달성해보세요!
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                새 목표 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새로운 목표 만들기</DialogTitle>
                <DialogDescription>
                  달성하고 싶은 목표를 설정하세요!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">목표 제목</Label>
                  <Input
                    id="title"
                    placeholder="예: 새 장난감 사기"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">목표 포인트</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="1000"
                    value={newGoalPoints}
                    onChange={(e) => setNewGoalPoints(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreateGoal} disabled={createGoalMutation.isPending}>
                  {createGoalMutation.isPending ? "생성 중..." : "목표 생성"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Points */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">현재 포인트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold">{currentPoints != null ? currentPoints.toLocaleString() : 0} P</div>
          </CardContent>
        </Card>

        {/* Active Goals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">진행 중인 목표</h2>
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  아직 설정된 목표가 없습니다
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  첫 목표 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => {
                const progress = (currentPoints / goal.target_points) * 100;
                const isCompleted = currentPoints >= goal.target_points;

                return (
                  <Card key={goal.id} className={isCompleted ? "border-green-500 border-2" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {goal.title}
                            {isCompleted && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {currentPoints != null ? currentPoints.toLocaleString() : 0} / {goal.target_points != null ? goal.target_points.toLocaleString() : 0} P
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Progress value={Math.min(progress, 100)} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {isCompleted ? (
                          <span className="text-green-600 font-semibold">
                            🎉 목표 달성! 축하합니다!
                          </span>
                        ) : (
                          `${Math.round(progress)}% 달성 - ${(goal.target_points - currentPoints) != null ? (goal.target_points - currentPoints).toLocaleString() : 0}P 남음`
                        )}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              완료한 목표
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="opacity-75">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      {goal.title}
                    </CardTitle>
                    <CardDescription>
                      {goal.target_points != null ? goal.target_points.toLocaleString() : 0} P 달성
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(goal.completed_at!).toLocaleDateString('ko-KR')} 완료
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
