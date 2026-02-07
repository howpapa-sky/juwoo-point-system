import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { seedShopItems } from "@/lib/seedShopItems";
import { getLoginUrl } from "@/const";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ShoppingCart, Coins, Plus, Sparkles, Clock, CheckCircle2, Package, Gift,
  Gamepad2, Crown, Ticket, ChevronDown, Star, Heart, Zap, Flame, Trophy,
  Target, Rocket, PartyPopper, ShoppingBag, TrendingUp, ArrowRight,
  Timer, AlertCircle, X, Percent, Tag, Award, CircleDollarSign,
  Smartphone, Tv, Pizza, IceCream, Candy, Cookie, Popcorn, Cake,
  Music, Palette, Dumbbell, Bike, BookOpen, Puzzle, Car, Plane
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";

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

// 카테고리별 아이콘 및 색상
const categoryConfig: Record<string, { icon: any; emoji: string; color: string; gradient: string }> = {
  "게임": { icon: Gamepad2, emoji: "🎮", color: "#8b5cf6", gradient: "from-purple-500 to-violet-500" },
  "특권": { icon: Crown, emoji: "👑", color: "#f59e0b", gradient: "from-amber-500 to-orange-500" },
  "이용권": { icon: Ticket, emoji: "🎫", color: "#3b82f6", gradient: "from-blue-500 to-cyan-500" },
  "선물": { icon: Gift, emoji: "🎁", color: "#ec4899", gradient: "from-pink-500 to-rose-500" },
  "간식": { icon: Cookie, emoji: "🍪", color: "#f97316", gradient: "from-orange-500 to-amber-500" },
  "장난감": { icon: Puzzle, emoji: "🧸", color: "#22c55e", gradient: "from-green-500 to-emerald-500" },
  "외출": { icon: Car, emoji: "🚗", color: "#06b6d4", gradient: "from-cyan-500 to-teal-500" },
  "전자기기": { icon: Smartphone, emoji: "📱", color: "#6366f1", gradient: "from-indigo-500 to-purple-500" },
};

// 아이템별 특수 이모지
const itemEmojis: Record<string, string> = {
  "게임": "🎮", "스위치": "🕹️", "닌텐도": "🕹️", "포켓몬": "⚡",
  "유튜브": "📺", "TV": "📺", "영상": "🎬", "영화": "🎥",
  "아이스크림": "🍦", "과자": "🍪", "사탕": "🍭", "초콜릿": "🍫",
  "피자": "🍕", "치킨": "🍗", "햄버거": "🍔", "음료": "🥤",
  "레고": "🧱", "장난감": "🧸", "인형": "🧸", "로봇": "🤖",
  "책": "📚", "만화": "📖", "그림": "🎨", "색칠": "🖍️",
  "놀이공원": "🎡", "키즈카페": "🎢", "수영장": "🏊", "공원": "🌳",
};

// 격려 메시지
const encouragementMessages = [
  { min: 0.9, message: "거의 다 모았어요! 조금만 더!", emoji: "🔥" },
  { min: 0.7, message: "70% 달성! 잘하고 있어요!", emoji: "💪" },
  { min: 0.5, message: "절반 왔어요! 화이팅!", emoji: "⭐" },
  { min: 0.3, message: "시작이 반이에요!", emoji: "🌟" },
  { min: 0, message: "열심히 모아보아요!", emoji: "💫" },
];

function getItemEmoji(name: string, category: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, emoji] of Object.entries(itemEmojis)) {
    if (lowerName.includes(key.toLowerCase())) return emoji;
  }
  return categoryConfig[category]?.emoji || "🎁";
}

function getEncouragement(progress: number): { message: string; emoji: string } {
  for (const enc of encouragementMessages) {
    if (progress >= enc.min) return enc;
  }
  return encouragementMessages[encouragementMessages.length - 1];
}

// 축하 이펙트
function celebratePurchase() {
  // 왼쪽에서 발사
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.1, y: 0.6 },
    colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6'],
  });
  // 오른쪽에서 발사
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.9, y: 0.6 },
    colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6'],
  });
  // 중앙 위에서 발사
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 100,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#ffd700', '#ff6b6b', '#4ecdc4'],
    });
  }, 200);
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
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<{name: string; cost: number} | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("shop");

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Seed shop items on first visit
        await seedShopItems();

        const { data: itemsData } = await supabase
          .from('shop_items')
          .select('*')
          .eq('is_available', true)
          .order('category')
          .order('point_cost');

        setItems(itemsData || []);

        const { data: profileData } = await supabase
          .from('juwoo_profile')
          .select('current_points')
          .eq('id', 1)
          .single();

        setBalance(profileData?.current_points || 0);

        const { data: purchasesData } = await supabase
          .from('purchases')
          .select(`
            id, item_id, point_cost, status, created_at, note,
            shop_items (name)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

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

        // 위시리스트 로드 (localStorage)
        const savedWishlist = localStorage.getItem('juwoo-wishlist');
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      } catch (error) {
        console.error('Error fetching shop data:', error);
        toast.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // 위시리스트 토글
  const toggleWishlist = (itemId: number) => {
    const newWishlist = wishlist.includes(itemId)
      ? wishlist.filter(id => id !== itemId)
      : [...wishlist, itemId];
    setWishlist(newWishlist);
    localStorage.setItem('juwoo-wishlist', JSON.stringify(newWishlist));

    if (!wishlist.includes(itemId)) {
      toast.success('위시리스트에 추가했어요! 💝');
    }
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;

    setPurchasing(true);
    try {
      if (balance < selectedItem.point_cost) {
        toast.error('포인트가 부족해요! 😢');
        return;
      }

      const newBalance = balance - selectedItem.point_cost;

      await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          amount: -selectedItem.point_cost,
          balance_after: newBalance,
          note: `상점 구매: ${selectedItem.name}`,
          created_by: 1,
        });

      await supabase
        .from('purchases')
        .insert({
          item_id: selectedItem.id,
          point_cost: selectedItem.point_cost,
          status: 'completed',
          note: `${selectedItem.name} 구매`,
          approved_at: new Date().toISOString(),
        });

      setBalance(newBalance);
      setLastPurchase({ name: selectedItem.name, cost: selectedItem.point_cost });
      setSelectedItem(null);
      setShowSuccess(true);
      celebratePurchase();

      // 위시리스트에서 제거
      if (wishlist.includes(selectedItem.id)) {
        toggleWishlist(selectedItem.id);
      }

    } catch (error) {
      console.error('Error purchasing item:', error);
      toast.error('구매에 실패했어요. 다시 시도해주세요!');
    } finally {
      setPurchasing(false);
    }
  };

  const handleCustomPurchase = async () => {
    if (!customItemName.trim() || !customItemCost) {
      toast.error('항목명과 금액을 모두 입력해주세요!');
      return;
    }

    const cost = parseInt(customItemCost);
    if (isNaN(cost) || cost <= 0) {
      toast.error('올바른 금액을 입력해주세요!');
      return;
    }

    if (balance < cost) {
      toast.error('포인트가 부족해요! 😢');
      return;
    }

    setPurchasing(true);
    try {
      const newBalance = balance - cost;

      await supabase
        .from('juwoo_profile')
        .update({ current_points: newBalance })
        .eq('id', 1);

      await supabase
        .from('point_transactions')
        .insert({
          juwoo_id: 1,
          rule_id: null,
          amount: -cost,
          balance_after: newBalance,
          note: `수기 구매: ${customItemName.trim()}`,
          created_by: 1,
        });

      const { data: tempItem } = await supabase
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

      if (tempItem) {
        await supabase
          .from('purchases')
          .insert({
            item_id: tempItem.id,
            point_cost: cost,
            status: 'completed',
            note: `수기 입력: ${customItemName.trim()}`,
            approved_at: new Date().toISOString(),
          });
      }

      setBalance(newBalance);
      setLastPurchase({ name: customItemName, cost });
      setShowCustomPurchase(false);
      setCustomItemName('');
      setCustomItemCost('');
      setShowSuccess(true);
      celebratePurchase();

    } catch (error) {
      console.error('Error custom purchasing:', error);
      toast.error('구매에 실패했어요. 다시 시도해주세요!');
    } finally {
      setPurchasing(false);
    }
  };

  // 계산된 데이터
  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(items.map(i => i.category)))];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) => selectedCategory === "all" || item.category === selectedCategory
    );
  }, [items, selectedCategory]);

  const affordableItems = useMemo(() => {
    return items.filter(item => balance >= item.point_cost);
  }, [items, balance]);

  const almostAffordableItems = useMemo(() => {
    return items
      .filter(item => balance < item.point_cost && balance >= item.point_cost * 0.5)
      .sort((a, b) => (balance / a.point_cost) - (balance / b.point_cost))
      .reverse()
      .slice(0, 3);
  }, [items, balance]);

  const wishlistItems = useMemo(() => {
    return items.filter(item => wishlist.includes(item.id));
  }, [items, wishlist]);

  const pendingPurchases = purchases.filter(p => p.status === "pending");
  const completedPurchases = purchases.filter(p => p.status === "completed");

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
            <CardHeader className="text-center pb-2">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mx-auto"
              >
                <div className="p-5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl w-fit mb-4 shadow-lg shadow-pink-500/30">
                  <ShoppingBag className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-black">
                주우의 포인트 상점 🛍️
              </CardTitle>
              <CardDescription className="text-base">
                로그인하고 멋진 상품을 구경해요!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              <a href={getLoginUrl()}>
                <Button className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg">
                  로그인하기 ✨
                </Button>
              </a>
            </CardContent>
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
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 10 }}
          className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 12 }}
          className="absolute top-1/2 -left-20 w-60 h-60 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute bottom-1/4 right-0 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"
        />
      </div>

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
              onClick={() => setShowCustomPurchase(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              수기입력
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
              <motion.div
                animate={{ x: [0, -80, 0], y: [0, 30, 0] }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full"
              />
            </div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
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
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Sparkles className="h-8 w-8 text-yellow-300" />
                  </motion.div>
                  <Badge className="bg-yellow-400/30 text-yellow-100 border-0 text-xs">
                    VIP ⭐
                  </Badge>
                </div>
              </div>

              {/* 구매 가능 안내 */}
              <div className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {affordableItems.length}개 상품 구매 가능!
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full bg-white/80 backdrop-blur-sm shadow-lg p-1 rounded-2xl">
            <TabsTrigger value="shop" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold">
              <ShoppingBag className="h-4 w-4 mr-1" />
              상점
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold">
              <Heart className="h-4 w-4 mr-1" />
              찜 ({wishlist.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-bold">
              <Package className="h-4 w-4 mr-1" />
              내역
            </TabsTrigger>
          </TabsList>

          {/* 상점 탭 */}
          <TabsContent value="shop" className="space-y-4">
            {/* 거의 다 모은 상품 */}
            {almostAffordableItems.length > 0 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      거의 다 모았어요! 🔥
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {almostAffordableItems.map((item) => {
                        const progress = (balance / item.point_cost) * 100;
                        const needed = item.point_cost - balance;
                        const enc = getEncouragement(progress / 100);

                        return (
                          <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-3 bg-white rounded-xl shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getItemEmoji(item.name, item.category)}</span>
                              <div className="flex-1">
                                <p className="font-bold text-sm text-slate-800">{item.name}</p>
                                <p className="text-xs text-orange-600 font-medium">
                                  {enc.emoji} {needed.toLocaleString()}P만 더 모으면 돼요!
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600">{item.point_cost.toLocaleString()}P</p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Progress value={progress} className="h-2 bg-orange-100" />
                              <p className="text-xs text-slate-500 mt-1 text-right">
                                {Math.round(progress)}% 달성
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 승인 대기 */}
            {pendingPurchases.length > 0 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <Card className="border-0 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-blue-800 text-sm">승인 대기 중</p>
                        <p className="text-xs text-blue-600">{pendingPurchases.length}개의 요청이 있어요</p>
                      </div>
                      <Timer className="h-5 w-5 text-blue-400 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 카테고리 필터 */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            >
              {categories.map((cat) => {
                const config = categoryConfig[cat];
                return (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full whitespace-nowrap flex-shrink-0 font-bold ${
                      selectedCategory === cat
                        ? `bg-gradient-to-r ${config?.gradient || 'from-pink-500 to-rose-500'} border-0 shadow-lg`
                        : "bg-white/80 border-slate-200 hover:bg-white"
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === "all" ? "🏪 전체" : `${config?.emoji || '📦'} ${cat}`}
                  </Button>
                );
              })}
            </motion.div>

            {/* 상품 그리드 */}
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => {
                  const canAfford = balance >= item.point_cost;
                  const config = categoryConfig[item.category];
                  const isWishlisted = wishlist.includes(item.id);
                  const emoji = getItemEmoji(item.name, item.category);
                  const progress = canAfford ? 100 : (balance / item.point_cost) * 100;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
                      <Card
                        className={`border-0 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden transition-all hover:shadow-xl ${
                          !canAfford ? "opacity-70" : ""
                        }`}
                      >
                        <CardContent className="p-0">
                          {/* 상단 영역 */}
                          <div className={`p-4 bg-gradient-to-br ${config?.gradient || 'from-pink-100 to-rose-100'} relative`}>
                            {/* 찜 버튼 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(item.id);
                              }}
                              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-all"
                            >
                              <Heart
                                className={`h-4 w-4 transition-all ${
                                  isWishlisted ? "fill-pink-500 text-pink-500" : "text-slate-400"
                                }`}
                              />
                            </button>

                            {/* 구매 가능 배지 */}
                            {canAfford && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-green-500 text-white border-0 text-xs font-bold">
                                  구매가능 ✓
                                </Badge>
                              </div>
                            )}

                            <div className="flex justify-center pt-4 pb-2">
                              <motion.span
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2, delay: index * 0.1 }}
                                className="text-5xl"
                              >
                                {emoji}
                              </motion.span>
                            </div>
                          </div>

                          {/* 하단 정보 */}
                          <div className="p-4">
                            <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                                {item.description}
                              </p>
                            )}

                            {/* 진행률 (못 사는 경우) */}
                            {!canAfford && (
                              <div className="mb-3">
                                <Progress value={progress} className="h-1.5" />
                                <p className="text-xs text-slate-400 mt-1">
                                  {Math.round(progress)}% 달성
                                </p>
                              </div>
                            )}

                            {/* 구매 버튼 */}
                            <Button
                              className={`w-full font-bold rounded-xl ${
                                canAfford
                                  ? `bg-gradient-to-r ${config?.gradient || 'from-pink-500 to-rose-500'} hover:opacity-90`
                                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
                              }`}
                              onClick={() => canAfford && setSelectedItem(item)}
                              disabled={!canAfford}
                            >
                              {item.point_cost.toLocaleString()}P
                              {canAfford && <Sparkles className="h-4 w-4 ml-1" />}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
              <Card className="border-0 bg-white/80 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">이 카테고리에 상품이 없어요</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 위시리스트 탭 */}
          <TabsContent value="wishlist" className="space-y-4">
            {wishlistItems.length > 0 ? (
              <div className="space-y-3">
                {wishlistItems.map((item) => {
                  const canAfford = balance >= item.point_cost;
                  const emoji = getItemEmoji(item.name, item.category);
                  const progress = canAfford ? 100 : (balance / item.point_cost) * 100;
                  const needed = item.point_cost - balance;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                    >
                      <Card className="border-0 bg-white/90 shadow-lg rounded-2xl overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <span className="text-4xl">{emoji}</span>
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-800">{item.name}</h3>
                              {!canAfford && (
                                <p className="text-sm text-orange-600">
                                  🔥 {needed.toLocaleString()}P 더 필요해요!
                                </p>
                              )}
                              {!canAfford && (
                                <Progress value={progress} className="h-2 mt-2" />
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <p className="font-bold text-lg text-pink-600">
                                {item.point_cost.toLocaleString()}P
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg"
                                  onClick={() => toggleWishlist(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                {canAfford && (
                                  <Button
                                    size="sm"
                                    className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-500"
                                    onClick={() => setSelectedItem(item)}
                                  >
                                    구매
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 bg-white/80 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Heart className="h-16 w-16 mx-auto text-pink-200 mb-4" />
                  <p className="text-slate-500 font-medium mb-2">찜한 상품이 없어요</p>
                  <p className="text-sm text-slate-400">
                    하트를 눌러서 갖고 싶은 상품을 찜해보세요! 💝
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 구매 내역 탭 */}
          <TabsContent value="history" className="space-y-4">
            {completedPurchases.length > 0 ? (
              <div className="space-y-3">
                {completedPurchases.map((purchase, index) => (
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
                              <p className="font-bold text-slate-800">{purchase.item_name}</p>
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
                ))}
              </div>
            ) : (
              <Card className="border-0 bg-white/80 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Package className="h-16 w-16 mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-500 font-medium">아직 구매 내역이 없어요</p>
                  <p className="text-sm text-slate-400">상점에서 멋진 상품을 구매해보세요! 🛍️</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 수기 입력 다이얼로그 */}
      <Dialog open={showCustomPurchase} onOpenChange={setShowCustomPurchase}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Plus className="h-5 w-5 text-pink-500" />
              수기 입력 구매
            </DialogTitle>
            <DialogDescription>
              원하는 것을 직접 입력해서 구매해요!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="itemName" className="text-sm font-bold">무엇을 살까요?</Label>
              <Input
                id="itemName"
                placeholder="예: 닌텐도 게임 10분 🎮"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="mt-1.5 rounded-xl h-12 text-lg"
              />
            </div>
            <div>
              <Label htmlFor="itemCost" className="text-sm font-bold">포인트는 얼마?</Label>
              <Input
                id="itemCost"
                type="number"
                placeholder="예: 3000"
                value={customItemCost}
                onChange={(e) => setCustomItemCost(e.target.value)}
                className="mt-1.5 rounded-xl h-12 text-lg"
              />
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-600">내 포인트</span>
                <span className="text-xl font-black text-purple-600">{balance.toLocaleString()}P</span>
              </div>
              {customItemCost && (
                <>
                  <div className="h-px bg-slate-200 my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">구매 후 잔액</span>
                    <span className={`font-bold ${
                      balance - parseInt(customItemCost || '0') < 0 ? 'text-rose-600' : 'text-green-600'
                    }`}>
                      {(balance - parseInt(customItemCost || '0')).toLocaleString()}P
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={() => {
                setShowCustomPurchase(false);
                setCustomItemName('');
                setCustomItemCost('');
              }}
            >
              취소
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 font-bold"
              onClick={handleCustomPurchase}
              disabled={purchasing || !customItemName.trim() || !customItemCost || balance < parseInt(customItemCost || '0')}
            >
              {purchasing ? "처리중..." : "구매하기 🎉"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  className={`p-6 bg-gradient-to-br ${categoryConfig[selectedItem.category]?.gradient || 'from-pink-100 to-rose-100'} rounded-3xl mb-4`}
                >
                  <span className="text-6xl">{getItemEmoji(selectedItem.name, selectedItem.category)}</span>
                </motion.div>
                <p className="font-black text-xl text-slate-800">{selectedItem.name}</p>
                {selectedItem.description && (
                  <p className="text-sm text-slate-500 mt-1">{selectedItem.description}</p>
                )}
              </motion.div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-center">
                <p className="text-white/70 text-xs mb-0.5">결제할 포인트</p>
                <p className="text-4xl font-black">
                  {selectedItem.point_cost.toLocaleString()}
                  <span className="text-lg ml-1">P</span>
                </p>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">구매 후 잔액</span>
                  <span className="font-bold text-green-600">
                    {(balance - selectedItem.point_cost).toLocaleString()}P
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
              아니요
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 font-bold"
              onClick={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? "처리중..." : "네, 살래요! 🎉"}
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
