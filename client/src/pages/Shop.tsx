import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, ShoppingCart, Coins, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ShopItem {
  id: number;
  name: string;
  description: string | null;
  category: string;
  point_cost: number;
  image_url: string | null;
  is_available: boolean;
}

interface Purchase {
  id: number;
  item_id: number | null;
  point_cost: number;
  status: string;
  created_at: string;
  item_name: string;
  note: string | null;
}

export default function Shop() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;
  
  const [items, setItems] = useState<ShopItem[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showCustomPurchase, setShowCustomPurchase] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCost, setCustomItemCost] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch shop items
        const { data: itemsData, error: itemsError } = await supabase
          .from('shop_items')
          .select('*')
          .eq('is_available', true)
          .order('category')
          .order('point_cost');

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

        // 2. Fetch balance
        const { data: profileData, error: profileError } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        if (profileError) throw profileError;
        setBalance(profileData?.current_points || 0);

        // 3. Fetch my purchases
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select(`
            id,
            item_id,
            point_cost,
            status,
            created_at,
            note,
            shop_items (name)
          `)
          .eq('juwoo_id', 1)
          .order('created_at', { ascending: false });

        if (purchasesError) throw purchasesError;

        const formattedPurchases = (purchasesData || []).map((p: any) => ({
          id: p.id,
          item_id: p.item_id,
          point_cost: p.point_cost,
          status: p.status,
          created_at: p.created_at,
          note: p.note,
          item_name: p.shop_items?.name || (p.note?.replace('수기 입력: ', '') || '알 수 없는 상품'),
        }));

        setPurchases(formattedPurchases);
      } catch (error: any) {
        console.error('Error fetching shop data:', error);
        toast.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handlePurchase = async () => {
    if (!selectedItem) return;
    
    setPurchasing(true);
    try {
      // Check if user has enough points
      if (balance < selectedItem.point_cost) {
        toast.error('포인트가 부족합니다.');
        return;
      }

      const newBalance = balance - selectedItem.point_cost;

      // 1. 포인트 차감 (juwoo_profile 업데이트)
      const { error: updateError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      if (updateError) throw updateError;

      // 2. 거래 내역 추가 (transactions)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          point_amount: -selectedItem.point_cost,
          balance_after: newBalance,
          description: `[상점] ${selectedItem.name}`,
          is_cancelled: false,
        });

      if (transactionError) throw transactionError;

      // 3. 구매 내역 추가 (purchases) - 자동 승인
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          juwoo_id: 1,
          item_id: selectedItem.id,
          point_cost: selectedItem.point_cost,
          status: 'approved',
          note: `${selectedItem.name} 구매`,
          approved_at: new Date().toISOString(),
        });

      if (purchaseError) throw purchaseError;

      toast.success(`구매 완료! ${selectedItem.point_cost.toLocaleString()}포인트가 차감되었습니다.`);
      setSelectedItem(null);
      
      // Refresh purchases
      window.location.reload();
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      toast.error('구매에 실패했습니다.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCustomPurchase = async () => {
    if (!customItemName.trim() || !customItemCost) {
      toast.error('항목명과 금액을 모두 입력해주세요.');
      return;
    }

    const cost = parseInt(customItemCost);
    if (isNaN(cost) || cost <= 0) {
      toast.error('유효한 금액을 입력해주세요.');
      return;
    }

    if (balance < cost) {
      toast.error('포인트가 부족합니다.');
      return;
    }

    setPurchasing(true);
    try {
      const newBalance = balance - cost;

      // 1. 포인트 차감 (juwoo_profile 업데이트)
      const { error: updateError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      if (updateError) throw updateError;

      // 2. 거래 내역 추가 (transactions)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          point_amount: -cost,
          balance_after: newBalance,
          description: `[수기입력] ${customItemName.trim()}`,
          is_cancelled: false,
        });

      if (transactionError) throw transactionError;

      // 3. 임시 shop_item 생성 (수기 입력용)
      const { data: tempItem, error: itemError } = await supabase
        .from('shop_items')
        .insert({
          name: `[수기입력] ${customItemName.trim()}`,
          description: '수기 입력으로 추가된 항목',
          point_cost: cost,
          category: '기타',
          is_available: false,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // 4. 구매 내역 추가 (purchases) - 자동 승인
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          juwoo_id: 1,
          item_id: tempItem.id,
          point_cost: cost,
          status: 'approved',
          note: `수기 입력: ${customItemName.trim()}`,
          approved_at: new Date().toISOString(),
        });

      if (purchaseError) throw purchaseError;

      toast.success(`구매 완료! ${cost.toLocaleString()}포인트가 차감되었습니다.`);
      setShowCustomPurchase(false);
      setCustomItemName('');
      setCustomItemCost('');
      
      // Refresh purchases
      window.location.reload();
    } catch (error: any) {
      console.error('Error custom purchasing:', error);
      toast.error('구매에 실패했습니다.');
    } finally {
      setPurchasing(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>상점을 이용하려면 로그인해주세요.</CardDescription>
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

  const categories = ["all", "게임"];

  const filteredItems = items.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const pendingPurchases = purchases.filter((p) => p.status === "pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              대시보드로
            </Button>
          </Link>
        </div>

        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2">포인트 상점 🛍️</h1>
          <p className="text-muted-foreground">포인트로 원하는 것을 구매하세요!</p>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 mb-1">내 포인트</p>
                <p className="text-4xl font-bold">{balance.toLocaleString()}</p>
              </div>
              <Coins className="h-16 w-16 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {pendingPurchases.length > 0 && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">승인 대기 중</CardTitle>
              <CardDescription className="text-yellow-700 dark:text-yellow-300">
                {pendingPurchases.length}개의 구매 요청이 승인을 기다리고 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium">{purchase.item_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">-{purchase.point_cost.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">승인 대기</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
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
          <Button
            variant="default"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setShowCustomPurchase(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            수기 입력
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">상품을 불러오는 중...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => {
              const canAfford = balance >= item.point_cost;
              return (
                <Card
                  key={item.id}
                  className={`hover:shadow-lg transition-shadow animate-slide-up ${
                    !canAfford ? "opacity-60" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                    <span className="category-badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {item.category}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">가격</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {item.point_cost.toLocaleString()}
                        </p>
                      </div>
                      <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <Button
                      className="w-full"
                      disabled={!canAfford || purchasing}
                      onClick={() => setSelectedItem(item)}
                    >
                      {canAfford ? "구매하기" : "포인트 부족"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 수기 입력 다이얼로그 */}
        <Dialog open={showCustomPurchase} onOpenChange={setShowCustomPurchase}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>수기 입력 구매</DialogTitle>
              <DialogDescription>
                항목명과 포인트 금액을 입력하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="itemName">항목명</Label>
                <Input
                  id="itemName"
                  placeholder="예: 포켓몬고 10분"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="itemCost">포인트 금액</Label>
                <Input
                  id="itemCost"
                  type="number"
                  placeholder="예: 3000"
                  value={customItemCost}
                  onChange={(e) => setCustomItemCost(e.target.value)}
                />
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                  <span className="font-medium">현재 포인트</span>
                  <span className="text-lg font-bold">{balance.toLocaleString()}</span>
                </div>
                {customItemCost && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">구매 후 잔액</span>
                    <span className={`text-sm font-bold ${
                      balance - parseInt(customItemCost || '0') < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {(balance - parseInt(customItemCost || '0')).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCustomPurchase(false);
                setCustomItemName('');
                setCustomItemCost('');
              }}>
                취소
              </Button>
              <Button onClick={handleCustomPurchase} disabled={purchasing}>
                구매 요청
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 기존 상품 구매 다이얼로그 */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>구매 확인</DialogTitle>
              <DialogDescription>
                정말로 이 상품을 구매하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="py-4">
                <div className="mb-4">
                  <p className="font-semibold text-lg mb-2">{selectedItem.name}</p>
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <span className="font-medium">가격</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {selectedItem.point_cost.toLocaleString()} 포인트
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  ⚠️ 구매 후 관리자의 승인이 필요합니다.
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                취소
              </Button>
              <Button onClick={handlePurchase} disabled={purchasing}>
                구매 요청
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
