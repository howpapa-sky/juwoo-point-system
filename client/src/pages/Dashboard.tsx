import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Coins, TrendingUp, TrendingDown, Activity, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface Transaction {
  id: number;
  amount: number;
  note: string | null;
  created_at: string;
  rule_name: string | null;
  rule_category: string | null;
  balance_after: number;
}

interface Stats {
  totalEarned: number;
  totalSpent: number;
}

export default function Dashboard() {
  const { user, userRole, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<Stats>({ totalEarned: 0, totalSpent: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch balance from juwoo_profile
        const { data: profileData, error: profileError } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        if (profileError) throw profileError;
        setBalance(profileData?.current_points || 0);

        // 2. Fetch recent 7 days stats
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: statsData, error: statsError } = await supabase
          .from('point_transactions')
          .select('amount')
          .eq('juwoo_id', 1)
          .gte('created_at', sevenDaysAgo.toISOString());

        if (statsError) throw statsError;

        const totalEarned = (statsData || [])
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalSpent = Math.abs(
          (statsData || [])
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0)
        );

        setStats({ totalEarned, totalSpent });

        // 3. Fetch recent 5 transactions with rule info
        const { data: txData, error: txError } = await supabase
          .from('point_transactions')
          .select(`
            id,
            amount,
            note,
            created_at,
            point_rules (
              name,
              category
            )
          `)
          .eq('juwoo_id', 1)
          .order('created_at', { ascending: false })
          .limit(5);

        if (txError) throw txError;

        // Calculate balance_after for each transaction
        let runningBalance = balance;
        const txWithBalance = (txData || []).map((tx: any) => {
          const balanceAfter = runningBalance;
          runningBalance -= tx.amount;
          return {
            id: tx.id,
            amount: tx.amount,
            note: tx.note,
            created_at: tx.created_at,
            rule_name: tx.point_rules?.name || null,
            rule_category: tx.point_rules?.category || null,
            balance_after: balanceAfter,
          };
        });

        setTransactions(txWithBalance);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, balance]);

  const handleCancel = async (transactionId: number) => {
    if (!confirm("정말로 이 거래를 취소하시겠습니까?")) return;

    try {
      // Find the transaction to cancel
      const { data: txData, error: txError } = await supabase
        .from('point_transactions')
        .select('amount')
        .eq('id', transactionId)
        .single();

      if (txError) throw txError;

      // Create a reverse transaction
      const { error: insertError } = await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          amount: -txData.amount,
          note: `취소: 거래 #${transactionId}`,
          created_by: null,
        });

      if (insertError) throw insertError;

      // Update juwoo_profile balance
      const { error: updateError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: balance - txData.amount })
        .eq('id', 1);

      if (updateError) throw updateError;

      toast.success("포인트가 취소되었습니다!");
      
      // Refresh data
      setBalance(prev => prev - txData.amount);
      window.location.reload();
    } catch (error: any) {
      console.error('Error canceling transaction:', error);
      toast.error('취소에 실패했습니다.');
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>대시보드를 보려면 로그인해주세요.</CardDescription>
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
          <h1 className="text-4xl font-bold mb-2">안녕하세요, {user?.user_metadata?.name || user?.email?.split('@')[0] || "주우"}님! 👋</h1>
          <p className="text-muted-foreground">오늘도 좋은 하루 보내세요!</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Coins className="h-6 w-6" />
                    내 포인트
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold mb-2">{balance.toLocaleString()}</div>
                  <p className="text-purple-100">포인트</p>
                </CardContent>
              </Card>

              <Card className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-6 w-6" />
                    이번 주 적립
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    +{stats.totalEarned.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground">포인트</p>
                </CardContent>
              </Card>

              <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="h-6 w-6" />
                    이번 주 사용
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    -{stats.totalSpent.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground">포인트</p>
                </CardContent>
              </Card>
            </div>

            <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6" />
                  최근 활동
                </CardTitle>
                <CardDescription>최근 5개의 포인트 변동 내역</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{tx.note || tx.rule_name || "포인트 변동"}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.rule_category && (
                              <span className="category-badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 mr-2">
                                {tx.rule_category}
                              </span>
                            )}
                            {new Date(tx.created_at).toLocaleDateString("ko-KR", {
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div
                              className={`text-xl font-bold ${
                                tx.amount > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {tx.amount > 0 ? "+" : ""}
                              {tx.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              잔액: {tx.balance_after.toLocaleString()}
                            </div>
                          </div>
                          {userRole === "admin" && !tx.note?.startsWith("취소:") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                              onClick={() => handleCancel(tx.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Link href="/transactions">
                      <Button variant="outline" className="w-full">
                        전체 내역 보기
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>아직 활동 내역이 없습니다.</p>
                    <p className="text-sm mt-2">좋은 행동으로 포인트를 모아보세요!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
