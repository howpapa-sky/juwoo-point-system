import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import {
  ShoppingCart,
  Coins,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  Package,
  Gift,
  Gamepad2,
  Crown,
  Ticket,
  ChevronDown,
} from "lucide-react";
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

const categoryIcons: Record<string, any> = {
  "게임": Gamepad2,
  "특권": Crown,
  "이용권": Ticket,
  "선물": Gift,
};

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
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: itemsData, error: itemsError } = await supabase
          .from('shop_items')
          .select('*')
          .eq('is_available', true)
          .order('category')
          .order('point_cost');

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

        const { data: profileData, error: profileError } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        if (profileError) throw profileError;
        setBalance(profileData?.current_points || 0);

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
      if (balance < selectedItem.point_cost) {
        toast.error('포인트가 부족합니다.');
        return;
      }

      const newBalance = balance - selectedItem.point_cost;

      const { error: updateError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          amount: -selectedItem.point_cost,
          balance_after: newBalance,
          note: `상점 구매: ${selectedItem.name}`,
          created_by: 1,
        });

      if (transactionError) throw transactionError;

      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          item_id: selectedItem.id,
          point_cost: selectedItem.point_cost,
          status: 'completed',
          note: `${selectedItem.name} 구매`,
          approved_at: new Date().toISOString(),
        });

      if (purchaseError) throw purchaseError;

      toast.success(`구매 완료! ${selectedItem.point_cost.toLocaleString()}P 차감`);
      setSelectedItem(null);
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

      const { error: updateError } = await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          amount: -cost,
          balance_after: newBalance,
          note: `수기 구매: ${customItemName.trim()}`,
          created_by: 1,
        });

      if (transactionError) throw transactionError;

      const { data: tempItem, error: itemError } = await supabase
        .from('shop_items')
        .insert({
          name: `[수기입력] ${customItemName.trim()}`,
          description: '수기 입력으로 추가된 항목',
          point_cost: cost,
          category: '특권',
          is_available: false,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          item_id: tempItem.id,
          point_cost: cost,
          status: 'completed',
          note: `수기 입력: ${customItemName.trim()}`,
          approved_at: new Date().toISOString(),
        });

      if (purchaseError) throw purchaseError;

      toast.success(`구매 완료! ${cost.toLocaleString()}P 차감`);
      setShowCustomPurchase(false);
      setCustomItemName('');
      setCustomItemCost('');
      window.location.reload();
    } catch (error: any) {
      console.error('Error custom purchasing:', error);
      toast.error('구매에 실패했습니다.');
    } finally {
      setPurchasing(false);
    }
  };

  // 로그인 필요 화면
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl w-fit mb-4 shadow-lg shadow-pink-500/30">
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-black">로그인이 필요해요</CardTitle>
            <CardDescription className="text-base">상점을 이용하려면 로그인해주세요</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <a href={getLoginUrl()}>
              <Button className="w-full h-14 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-pink-500/25 active:scale-[0.98] transition-all">
                로그인하기
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = ["all", ...Array.from(new Set(items.map(i => i.category)))];
  const filteredItems = items.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );
  const pendingPurchases = purchases.filter((p) => p.status === "pending");
  const completedPurchases = purchases.filter((p) => p.status === "completed").slice(0, 5);

  // 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-pink-200 rounded-full animate-spin border-t-pink-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-pink-600 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 mt-6 font-medium">상품을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-pink-400/30 to-rose-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-16 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-56 h-56 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-800">포인트 상점</h1>
            <p className="text-sm text-slate-500">원하는 상품을 구매하세요!</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50"
            onClick={() => setShowCustomPurchase(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            수기입력
          </Button>
        </div>

        {/* 포인트 잔액 카드 */}
        <Card className="border-0 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 text-white overflow-hidden shadow-2xl shadow-pink-500/30 rounded-3xl">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Coins className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-medium">사용 가능 포인트</p>
                  <p className="text-3xl font-black">{balance.toLocaleString()}<span className="text-base ml-1">P</span></p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="h-6 w-6 text-yellow-300" />
                <span className="text-xs text-white/70">VIP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 승인 대기 알림 */}
        {pendingPurchases.length > 0 && (
          <Card className="border-0 bg-amber-50 shadow-lg rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-800 text-sm">승인 대기 중</p>
                  <p className="text-xs text-amber-600">{pendingPurchases.length}개의 요청이 대기중이에요</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              className={`rounded-full whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 border-0 shadow-lg shadow-pink-500/25"
                  : "bg-white/80 border-slate-200"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? "전체" : cat}
            </Button>
          ))}
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item, index) => {
            const canAfford = balance >= item.point_cost;
            const IconComponent = categoryIcons[item.category] || Gift;
            return (
              <Card
                key={item.id}
                className={`border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden active:scale-[0.98] transition-all ${
                  !canAfford ? "opacity-60" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => canAfford && setSelectedItem(item)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-2xl mb-3 ${
                      canAfford
                        ? "bg-gradient-to-br from-pink-100 to-rose-100"
                        : "bg-slate-100"
                    }`}>
                      <IconComponent className={`h-8 w-8 ${canAfford ? "text-pink-600" : "text-slate-400"}`} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-1">{item.description}</p>
                    <div className={`w-full py-2 px-3 rounded-xl text-center font-bold ${
                      canAfford
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}>
                      {item.point_cost.toLocaleString()}P
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 최근 구매 내역 */}
        {completedPurchases.length > 0 && (
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
            <CardHeader className="pb-2 pt-4 px-4">
              <button
                className="flex items-center justify-between w-full"
                onClick={() => setShowHistory(!showHistory)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-base">최근 구매</CardTitle>
                    <CardDescription className="text-xs">{completedPurchases.length}개 항목</CardDescription>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showHistory ? "rotate-180" : ""}`} />
              </button>
            </CardHeader>
            {showHistory && (
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {completedPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-100">
                          <Package className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{purchase.item_name}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(purchase.created_at).toLocaleDateString("ko-KR", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-rose-500">
                        -{purchase.point_cost.toLocaleString()}P
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      {/* 수기 입력 다이얼로그 */}
      <Dialog open={showCustomPurchase} onOpenChange={setShowCustomPurchase}>
        <DialogContent className="max-w-[340px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">수기 입력 구매</DialogTitle>
            <DialogDescription>
              원하는 항목과 포인트를 입력하세요
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="itemName" className="text-sm font-semibold">항목명</Label>
              <Input
                id="itemName"
                placeholder="예: 포켓몬고 10분"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="mt-1.5 rounded-xl h-12"
              />
            </div>
            <div>
              <Label htmlFor="itemCost" className="text-sm font-semibold">포인트 금액</Label>
              <Input
                id="itemCost"
                type="number"
                placeholder="예: 3000"
                value={customItemCost}
                onChange={(e) => setCustomItemCost(e.target.value)}
                className="mt-1.5 rounded-xl h-12"
              />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">현재 포인트</span>
                <span className="text-lg font-bold text-slate-800">{balance.toLocaleString()}P</span>
              </div>
              {customItemCost && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-500">구매 후 잔액</span>
                  <span className={`font-bold ${
                    balance - parseInt(customItemCost || '0') < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {(balance - parseInt(customItemCost || '0')).toLocaleString()}P
                  </span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={() => {
                setShowCustomPurchase(false);
                setCustomItemName('');
                setCustomItemCost('');
              }}
            >
              취소
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500"
              onClick={handleCustomPurchase}
              disabled={purchasing || !customItemName.trim() || !customItemCost || balance < parseInt(customItemCost || '0')}
            >
              구매하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기존 상품 구매 다이얼로그 */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-[340px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">구매 확인</DialogTitle>
            <DialogDescription>
              이 상품을 구매할까요?
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="py-4">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl mb-3">
                  {(() => {
                    const IconComponent = categoryIcons[selectedItem.category] || Gift;
                    return <IconComponent className="h-10 w-10 text-pink-600" />;
                  })()}
                </div>
                <p className="font-bold text-lg text-slate-800">{selectedItem.name}</p>
                <p className="text-sm text-slate-500 mt-1">{selectedItem.description}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center">
                <p className="text-white/70 text-xs mb-0.5">결제 금액</p>
                <p className="text-3xl font-black">{selectedItem.point_cost.toLocaleString()}<span className="text-base ml-1">P</span></p>
              </div>
              <p className="text-xs text-slate-500 text-center mt-3">
                구매 즉시 포인트가 차감됩니다
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={() => setSelectedItem(null)}
            >
              취소
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500"
              onClick={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? "처리중..." : "구매하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
