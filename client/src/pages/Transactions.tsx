import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Receipt, X } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface Transaction {
  id: number;
  amount: number;
  note: string | null;
  created_at: string;
  rule_name: string | null;
  rule_category: string | null;
}

export default function Transactions() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('point_transactions')
          .select('id, amount, note, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        const formattedTransactions = (data || []).map((tx: any) => {
          // 거래 카테고리 분류
          const note = tx.note || "";
          let category = null;
          if (note.includes("금고 입금")) category = "금고 입금";
          else if (note.includes("금고 출금")) category = "금고 출금";
          else if (note.includes("이자")) category = "이자 수입";
          else if (note.includes("씨앗 심기")) category = "씨앗 심기";
          else if (note.includes("수확")) category = "씨앗 수확";
          else if (note.includes("목표 저축")) category = "목표 저축";
          else if (note.includes("취소")) category = "취소";

          return {
            id: tx.id,
            amount: tx.amount,
            note: tx.note,
            created_at: tx.created_at,
            rule_name: null,
            rule_category: category,
          };
        });

        setTransactions(formattedTransactions);
      } catch (error: any) {
        if (import.meta.env.DEV) console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isAuthenticated, limit]);

  const handleCancelTransaction = async (transactionId: number, amount: number) => {
    if (!confirm('이 거래를 취소하시겠습니까? 포인트가 자동으로 복원됩니다.')) {
      return;
    }

    setCancellingId(transactionId);
    try {
      // 1. 포인트 복원 (반대 금액 적용)
      const { data: juwooData, error: juwooError } = await supabase
        .from('juwoo_profile')
        .select('current_points')
        .eq('id', 1)
        .single();

      if (juwooError) throw juwooError;

      const newBalance = (juwooData?.current_points || 0) - amount;

      const { error: updateBalanceError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      if (updateBalanceError) throw updateBalanceError;

      // 2. 취소 거래 내역 추가
      const { error: insertError } = await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          amount: -amount,
          balance_after: newBalance,
          note: `거래 취소 (ID: ${transactionId})`,
          created_by: 1, // 시스템/관리자
        });

      if (insertError) throw insertError;

      toast.success('거래가 취소되었습니다', {
        description: `${Math.abs(amount).toLocaleString()} 포인트가 복원되었습니다.`,
      });

      fetchTransactions();
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Error cancelling transaction:', error);
      toast.error('거래 취소가 잘 안 됐어요', {
        description: error.message || '다시 시도해주세요.',
      });
    } finally {
      setCancellingId(null);
    }
  };

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
                          <p className="font-semibold">
                            {tx.note || tx.rule_name || "포인트 변동"}
                          </p>
                          {tx.rule_category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              tx.rule_category.includes("금고") ? "bg-blue-100 text-blue-700" :
                              tx.rule_category.includes("이자") ? "bg-blue-100 text-blue-700" :
                              tx.rule_category.includes("씨앗") ? "bg-emerald-100 text-emerald-700" :
                              tx.rule_category.includes("수확") ? "bg-emerald-100 text-emerald-700" :
                              tx.rule_category.includes("목표") ? "bg-amber-100 text-amber-700" :
                              tx.rule_category.includes("취소") ? "bg-slate-100 text-slate-600" :
                              "bg-purple-100 text-purple-700"
                            }`}>
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
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              tx.amount > 0 ? "text-green-600" : "text-slate-500"
                            }`}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount.toLocaleString()}
                          </div>
                        </div>
                        {!tx.note?.includes('취소') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancelTransaction(tx.id, tx.amount)}
                            disabled={cancellingId === tx.id}
                          >
                            {cancellingId === tx.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        )}
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
