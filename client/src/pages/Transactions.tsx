import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Receipt } from "lucide-react";
import { useState, useEffect } from "react";

interface Transaction {
  id: number;
  amount: number;
  note: string | null;
  created_at: string;
  balance_after: number;
  rule_name: string | null;
  rule_category: string | null;
}

export default function Transactions() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('point_transactions')
          .select(`
            id,
            amount,
            note,
            created_at,
            balance_after,
            point_rules (name, category)
          `)
          .eq('juwoo_id', 1)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        const formattedTransactions = (data || []).map((tx: any) => ({
          id: tx.id,
          amount: tx.amount,
          note: tx.note,
          created_at: tx.created_at,
          balance_after: tx.balance_after,
          rule_name: tx.point_rules?.name || null,
          rule_category: tx.point_rules?.category || null,
        }));

        setTransactions(formattedTransactions);
      } catch (error: any) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isAuthenticated, limit]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>거래 내역을 보려면 로그인해주세요.</CardDescription>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
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
          <h1 className="text-4xl font-bold mb-2">거래 내역 📋</h1>
          <p className="text-muted-foreground">모든 포인트 변동 내역을 확인하세요.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">거래 내역을 불러오는 중...</p>
          </div>
        ) : (
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-6 w-6" />
                전체 거래 내역
              </CardTitle>
              <CardDescription>
                최근 {transactions.length}개의 거래 내역
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{tx.note || tx.rule_name || "포인트 변동"}</p>
                          {tx.rule_category && (
                            <span className="category-badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              {tx.rule_category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div
                          className={`text-2xl font-bold ${
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
                    </div>
                  ))}
                  
                  {transactions.length >= limit && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setLimit(limit + 50)}
                    >
                      더 보기
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">거래 내역이 없습니다</p>
                  <p className="text-sm">좋은 행동으로 포인트를 모아보세요!</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
