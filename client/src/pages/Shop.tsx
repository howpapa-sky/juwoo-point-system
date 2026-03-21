import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ShoppingBag, Coins, Sparkles, CheckCircle2,
  Tablet, Youtube, Tv, PartyPopper, Clock
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// 고정 상점 아이템 (9개)
interface FixedShopItem {
  name: string;
  emoji: string;
  category: string;
  minutes: number;
  cost: number;
}

const SHOP_CATEGORIES = [
  { key: "tablet", label: "태블릿", emoji: "📱", icon: Tablet, gradient: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
  { key: "youtube", label: "유튜브", emoji: "▶️", icon: Youtube, gradient: "from-rose-500 to-pink-500", bg: "from-rose-50 to-pink-50" },
  { key: "netflix", label: "넷플릭스", emoji: "🎬", icon: Tv, gradient: "from-purple-500 to-violet-500", bg: "from-purple-50 to-violet-50" },
];

const SHOP_ITEMS: FixedShopItem[] = [
  { name: "태블릿 10분", emoji: "📱", category: "tablet", minutes: 10, cost: 3000 },
  { name: "태블릿 20분", emoji: "📱", category: "tablet", minutes: 20, cost: 6000 },
  { name: "태블릿 30분", emoji: "📱", category: "tablet", minutes: 30, cost: 9000 },
  { name: "유튜브 10분", emoji: "▶️", category: "youtube", minutes: 10, cost: 3000 },
  { name: "유튜브 20분", emoji: "▶️", category: "youtube", minutes: 20, cost: 6000 },
  { name: "유튜브 30분", emoji: "▶️", category: "youtube", minutes: 30, cost: 9000 },
  { name: "넷플릭스 10분", emoji: "🎬", category: "netflix", minutes: 10, cost: 3000 },
  { name: "넷플릭스 20분", emoji: "🎬", category: "netflix", minutes: 20, cost: 6000 },
  { name: "넷플릭스 30분", emoji: "🎬", category: "netflix", minutes: 30, cost: 9000 },
];

function celebratePurchase() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.1, y: 0.6 },
    colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6'],
  });
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.9, y: 0.6 },
    colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6'],
  });
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#ffd700', '#ff6b6b', '#4ecdc4'],
    });
  }, 200);
}

interface Purchase {
  id: number;
  point_cost: number;
  status: string;
  created_at: string;
  note: string | null;
}

export default function Shop() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const isAuthenticated = !!user;

  const [balance, setBalance] = useState<number>(0);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FixedShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<{ name: string; cost: number } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        setBalance(profileData?.current_points || 0);

        const { data: purchasesData } = await supabase
          .from('purchases')
          .select('id, point_cost, status, created_at, note')
          .order('created_at', { ascending: false })
          .limit(10);

        setPurchases(purchasesData || []);
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error fetching shop data:', error);
        toast.error('데이터를 불러오지 못했어요.');
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
      if (balance < selectedItem.cost) {
        toast.error('포인트가 부족해요! 😢');
        return;
      }

      const newBalance = balance - selectedItem.cost;

      await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          amount: -selectedItem.cost,
          balance_after: newBalance,
          note: `상점 구매: ${selectedItem.name}`,
          created_by: 1,
        });

      await supabase
        .from('purchases')
        .insert({
          item_id: null,
          point_cost: selectedItem.cost,
          status: 'completed',
          note: `상점 구매: ${selectedItem.name}`,
          approved_at: new Date().toISOString(),
        });

      setBalance(newBalance);
      setLastPurchase({ name: selectedItem.name, cost: selectedItem.cost });
      setSelectedItem(null);
      setShowSuccess(true);
      celebratePurchase();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error purchasing item:', error);
      toast.error('구매가 잘 안 됐어요. 다시 해볼까?');
    } finally {
      setPurchasing(false);
    }
  };

  // 로그인 필요
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
        >
          <Card className="max-w-sm w-full border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
            <div className="text-center p-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mx-auto"
              >
                <div className="p-5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl w-fit mx-auto mb-4 shadow-lg shadow-pink-500/30">
                  <ShoppingBag className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-black mb-2">주우의 포인트 상점 🛍️</h2>
              <p className="text-slate-500 mb-4">로그인하고 멋진 상품을 구경해요!</p>
              <a href={getLoginUrl()}>
                <Button className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg">
                  로그인하기 ✨
                </Button>
              </a>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // 로딩
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="w-24 h-24 border-4 border-pink-200 rounded-full border-t-pink-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-pink-500" />
          </div>
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-pink-600 mt-6 font-bold text-lg"
        >
          상점을 여는 중... 🎁
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="px-4 pt-4 space-y-4 max-w-2xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pt-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                주우 상점 🛍️
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                포인트로 원하는 걸 가져가세요!
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50 font-bold"
              onClick={() => setShowHistory(!showHistory)}
            >
              <Clock className="h-4 w-4 mr-1" />
              {showHistory ? "상점" : "내역"}
            </Button>
          </div>
        </motion.div>

        {/* 포인트 잔액 카드 */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white overflow-hidden shadow-2xl shadow-purple-500/30 rounded-3xl relative">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full"
              />
            </div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm"
                >
                  <Coins className="h-8 w-8" />
                </motion.div>
                <div>
                  <p className="text-white/70 text-sm font-medium">내 포인트</p>
                  <p className="text-4xl font-black">
                    {balance.toLocaleString()}
                    <span className="text-lg ml-1">P</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 구매 내역 */}
        {showHistory ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-black text-slate-800">구매 내역</h2>
            {purchases.length > 0 ? (
              purchases.map((purchase, index) => (
                <motion.div
                  key={purchase.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 bg-white/90 shadow-md rounded-xl overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {purchase.note?.replace('상점 구매: ', '').replace('수기 구매: ', '').replace('수기 입력: ', '') || '구매'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(purchase.created_at).toLocaleDateString("ko-KR", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-rose-200 text-rose-600 font-bold">
                          -{purchase.point_cost.toLocaleString()}P
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="border-0 bg-white/80 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-medium">아직 구매 내역이 없어요</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          /* 상점 아이템 */
          <div className="space-y-4">
            {SHOP_CATEGORIES.map((cat, catIndex) => {
              const catItems = SHOP_ITEMS.filter(item => item.category === cat.key);
              const CatIcon = cat.icon;

              return (
                <motion.div
                  key={cat.key}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + catIndex * 0.1 }}
                >
                  <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
                    {/* 카테고리 헤더 */}
                    <div className={`p-4 bg-gradient-to-r ${cat.bg} flex items-center gap-3`}>
                      <div className={`p-2.5 bg-gradient-to-br ${cat.gradient} rounded-xl shadow-md`}>
                        <CatIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-black text-slate-800">{cat.emoji} {cat.label}</span>
                    </div>

                    {/* 시간별 아이템 */}
                    <CardContent className="p-3">
                      <div className="grid grid-cols-3 gap-2">
                        {catItems.map((item) => {
                          const canAfford = balance >= item.cost;

                          return (
                            <motion.button
                              key={item.name}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => canAfford && setSelectedItem(item)}
                              disabled={!canAfford}
                              className={`relative p-3 rounded-xl text-center transition-all ${
                                canAfford
                                  ? `bg-gradient-to-br ${cat.bg} hover:shadow-md cursor-pointer`
                                  : "bg-slate-50 opacity-50 cursor-not-allowed"
                              }`}
                            >
                              {canAfford && (
                                <div className="absolute -top-1 -right-1">
                                  <span className="flex h-3 w-3">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r ${cat.gradient} opacity-75`} />
                                    <span className={`relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r ${cat.gradient}`} />
                                  </span>
                                </div>
                              )}
                              <p className="text-2xl font-black text-slate-800">{item.minutes}분</p>
                              <p className={`text-sm font-bold mt-1 ${canAfford ? 'text-slate-600' : 'text-slate-400'}`}>
                                {item.cost.toLocaleString()}P
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 구매 확인 다이얼로그 */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-center">
              이거 살까요? 🤔
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="py-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center text-center mb-4"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl mb-3"
                >
                  {selectedItem.emoji}
                </motion.div>
                <p className="font-black text-xl text-slate-800">{selectedItem.name}</p>
              </motion.div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-center">
                <p className="text-white/70 text-xs mb-0.5">결제할 포인트</p>
                <p className="text-4xl font-black">
                  {selectedItem.cost.toLocaleString()}
                  <span className="text-lg ml-1">P</span>
                </p>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">구매 후 잔액</span>
                  <span className="font-bold text-green-600">
                    {(balance - selectedItem.cost).toLocaleString()}P
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={() => setSelectedItem(null)}
            >
              좀 더 생각해볼래
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 font-bold"
              onClick={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? "처리중..." : "사기! 🎉"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 구매 성공 다이얼로그 */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-[360px] rounded-3xl text-center">
          <div className="py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                <PartyPopper className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-black text-slate-800 mb-2">
                구매 완료! 🎉
              </h2>
              {lastPurchase && (
                <>
                  <p className="text-lg font-bold text-purple-600 mb-1">
                    {lastPurchase.name}
                  </p>
                  <p className="text-slate-500">
                    {lastPurchase.cost.toLocaleString()}P를 사용했어요
                  </p>
                </>
              )}
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl"
            >
              <p className="text-amber-800 font-medium">
                ⭐ 잘했어요! 열심히 모은 포인트로 좋은 거 샀네요!
              </p>
            </motion.div>
          </div>
          <Button
            className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 font-bold"
            onClick={() => setShowSuccess(false)}
          >
            확인 ✓
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
