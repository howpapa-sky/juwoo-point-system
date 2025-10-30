import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function PointsManage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: rules, isLoading: rulesLoading } = trpc.pointRules.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const utils = trpc.useUtils();
  const addPointsMutation = trpc.points.add.useMutation({
    onSuccess: () => {
      utils.points.balance.invalidate();
      utils.points.transactions.invalidate();
      utils.points.stats.invalidate();
      toast.success("포인트가 적용되었습니다!");
    },
    onError: (error) => {
      toast.error(error.message || "포인트 적용에 실패했습니다.");
    },
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>관리자만 포인트를 관리할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApplyRule = async (ruleId: number, ruleName: string, amount: number) => {
    addPointsMutation.mutate({
      ruleId,
      amount,
      note: ruleName,
    });
  };

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

  const filteredRules = rules?.filter(
    (rule) => selectedCategory === "all" || rule.category === selectedCategory
  );

  const positiveRules = filteredRules?.filter((rule) => rule.pointAmount > 0);
  const negativeRules = filteredRules?.filter((rule) => rule.pointAmount < 0);

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
          <h1 className="text-4xl font-bold mb-2">포인트 관리 ⚙️</h1>
          <p className="text-muted-foreground">주우의 행동에 따라 포인트를 적립하거나 차감하세요.</p>
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

        {rulesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">규칙을 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {positiveRules && positiveRules.length > 0 && (
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
                            +{rule.pointAmount.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleApplyRule(rule.id, rule.name, rule.pointAmount)}
                            disabled={addPointsMutation.isPending}
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

            {negativeRules && negativeRules.length > 0 && (
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
                            {rule.pointAmount.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApplyRule(rule.id, rule.name, rule.pointAmount)}
                            disabled={addPointsMutation.isPending}
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
    </div>
  );
}
