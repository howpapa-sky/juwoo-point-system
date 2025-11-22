import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowLeft, ShoppingCart, Coins } from "lucide-react";
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
  item_id: number;
  point_cost: number;
  status: string;
  created_at: string;
  item_name: string;
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
          item_name: p.shop_items?.name || '알 수 없는 상품',
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

      // Insert purchase record
      const { error: insertError } = await supabase
        .from('purchases')
        .insert({
          juwoo_id: 1,
          item_id: selectedItem.id,
          point_cost: selectedItem.point_cost,
          status: 'pending',
          note: `${selectedItem.name} 구매 요청`,
        });

      if (insertError) throw insertError;

      toast.success('구매 요청이 완료되었습니다! 관리자의 승인을 기다려주세요.');
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

  const categories = ["all", "게임시간", "장난감", "간식음식", "특별활동", "특권"];

  const filteredItems = items.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const pendingPurchases = purchases.filter((p) => p.status === "pending");

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
