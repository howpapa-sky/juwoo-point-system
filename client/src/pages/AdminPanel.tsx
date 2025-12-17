import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, Settings, Users, TrendingUp, Activity, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

interface PointStat {
  total_earned: number;
  total_spent: number;
  current_balance: number;
  transaction_count: number;
}

interface TopRule {
  rule_name: string;
  category: string;
  count: number;
  total_amount: number;
}

interface RecentTransaction {
  id: number;
  amount: number;
  note: string | null;
  created_at: string;
  rule_name: string | null;
}

export default function AdminPanel() {
  const { user, userRole, loading: authLoading } = useSupabaseAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pointStats, setPointStats] = useState<PointStat | null>(null);
  const [topEarnRules, setTopEarnRules] = useState<TopRule[]>([]);
  const [topSpendRules, setTopSpendRules] = useState<TopRule[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!user || userRole !== 'admin') return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. 사용자 목록 조회
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, role, created_at')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        setUsers(usersData || []);

        // 2. 포인트 통계 조회
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('point_transactions')
          .select('amount');

        if (transactionsError) throw transactionsError;

        const earned = transactionsData?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0;
        const spent = Math.abs(transactionsData?.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0) || 0);

        const { data: profileData, error: profileError } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        if (profileError) throw profileError;

        setPointStats({
          total_earned: earned,
          total_spent: spent,
          current_balance: profileData?.current_points || 0,
          transaction_count: transactionsData?.length || 0,
        });

        // 3. 최다 적립 규칙
        const { data: earnRulesData, error: earnRulesError } = await supabase
          .from('point_transactions')
          .select(`
            amount,
            note
          `)
          .gt('amount', 0);

        if (earnRulesError) throw earnRulesError;

        const earnRulesMap = new Map<string, TopRule>();
        earnRulesData?.forEach((tx: any) => {
          const noteName = tx.note || '기타';

          const existing = earnRulesMap.get(noteName);
          if (existing) {
            existing.count += 1;
            existing.total_amount += tx.amount;
          } else {
            earnRulesMap.set(noteName, {
              rule_name: noteName,
              category: '',
              count: 1,
              total_amount: tx.amount,
            });
          }
        });

        const topEarn = Array.from(earnRulesMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopEarnRules(topEarn);

        // 4. 최다 차감 규칙
        const { data: spendRulesData, error: spendRulesError } = await supabase
          .from('point_transactions')
          .select(`
            amount,
            note
          `)
          .lt('amount', 0);

        if (spendRulesError) throw spendRulesError;

        const spendRulesMap = new Map<string, TopRule>();
        spendRulesData?.forEach((tx: any) => {
          const noteName = tx.note || '기타';

          const existing = spendRulesMap.get(noteName);
          if (existing) {
            existing.count += 1;
            existing.total_amount += Math.abs(tx.amount);
          } else {
            spendRulesMap.set(noteName, {
              rule_name: noteName,
              category: '',
              count: 1,
              total_amount: Math.abs(tx.amount),
            });
          }
        });

        const topSpend = Array.from(spendRulesMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopSpendRules(topSpend);

        // 5. 최근 거래 내역
        const { data: recentData, error: recentError } = await supabase
          .from('point_transactions')
          .select(`
            id,
            amount,
            note,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (recentError) throw recentError;

        const formattedRecent = (recentData || []).map((tx: any) => ({
          id: tx.id,
          amount: tx.amount,
          note: tx.note,
          created_at: tx.created_at,
          rule_name: null,
        }));
        setRecentTransactions(formattedRecent);

      } catch (error: any) {
        console.error('Error fetching admin data:', error);
        toast.error('데이터 로드 실패', {
          description: error.message || '다시 시도해주세요.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userRole]);

  const handleRoleChange = async (userId: number, newRole: 'admin' | 'user') => {
    if (!confirm(`이 사용자의 역할을 ${newRole === 'admin' ? '관리자' : '일반 사용자'}로 변경하시겠습니까?`)) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('역할 변경 완료', {
        description: `사용자 역할이 ${newRole === 'admin' ? '관리자' : '일반 사용자'}로 변경되었습니다.`,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('역할 변경 실패', {
        description: error.message || '다시 시도해주세요.',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>관리자 패널을 사용하려면 로그인해주세요.</CardDescription>
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

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>접근 권한이 없습니다</CardTitle>
            <CardDescription>관리자만 이 페이지에 접근할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">대시보드로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              대시보드로
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Settings className="h-10 w-10" />
            관리자 패널 ⚙️
          </h1>
          <p className="text-muted-foreground">시스템을 관리하세요!</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 포인트 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  포인트 통계
                </CardTitle>
                <CardDescription>전체 포인트 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-600 font-medium mb-1">총 적립</p>
                    <p className="text-2xl font-bold text-green-700">
                      +{pointStats?.total_earned?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 font-medium mb-1">총 차감</p>
                    <p className="text-2xl font-bold text-red-700">
                      -{pointStats?.total_spent?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-1">현재 잔액</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {pointStats?.current_balance?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-1">총 거래</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {pointStats?.transaction_count?.toLocaleString() || 0}건
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* 최다 적립 규칙 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">최다 적립 규칙 TOP 5</h3>
                    <div className="space-y-2">
                      {topEarnRules.length > 0 ? (
                        topEarnRules.map((rule, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-100">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{rule.rule_name}</p>
                              <p className="text-xs text-muted-foreground">{rule.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-600">{rule.count}회</p>
                              <p className="text-xs text-muted-foreground">+{rule.total_amount.toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">데이터가 없습니다</p>
                      )}
                    </div>
                  </div>

                  {/* 최다 차감 규칙 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">최다 차감 규칙 TOP 5</h3>
                    <div className="space-y-2">
                      {topSpendRules.length > 0 ? (
                        topSpendRules.map((rule, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{rule.rule_name}</p>
                              <p className="text-xs text-muted-foreground">{rule.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-red-600">{rule.count}회</p>
                              <p className="text-xs text-muted-foreground">-{rule.total_amount.toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">데이터가 없습니다</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 사용자 관리 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  사용자 관리
                </CardTitle>
                <CardDescription>전체 사용자 목록 및 역할 관리</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{u.email}</p>
                          {u.role === 'admin' && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                              <Shield className="h-3 w-3 inline mr-1" />
                              관리자
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          가입일: {new Date(u.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {u.role === 'user' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleChange(u.id, 'admin')}
                            disabled={updatingUserId === u.id}
                          >
                            {updatingUserId === u.id ? '처리 중...' : '관리자로 변경'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleChange(u.id, 'user')}
                            disabled={updatingUserId === u.id}
                          >
                            {updatingUserId === u.id ? '처리 중...' : '일반 사용자로 변경'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 시스템 로그 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  시스템 로그
                </CardTitle>
                <CardDescription>최근 거래 내역 (최근 10건)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{tx.note || tx.rule_name || '포인트 변동'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">거래 내역이 없습니다</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
