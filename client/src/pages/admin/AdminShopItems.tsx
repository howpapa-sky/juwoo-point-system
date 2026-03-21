import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Grid,
  List,
  Filter,
  RefreshCw,
  Coins,
  Package,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface ShopItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  icon: string | null;
  image_url: string | null;
  is_available: boolean;
  stock_quantity: number | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "게임시간", label: "게임시간", emoji: "🎮" },
  { value: "장난감", label: "장난감", emoji: "🧸" },
  { value: "간식음식", label: "간식음식", emoji: "🍪" },
  { value: "특별활동", label: "특별활동", emoji: "🎡" },
  { value: "특권", label: "특권", emoji: "👑" },
];

const EMOJI_OPTIONS = ["🎮", "🧸", "🍪", "🎡", "👑", "🎁", "🍕", "🍦", "🎬", "📱", "🎨", "⚽", "🎸", "🎯", "🌟", "💎"];

const defaultItem: Partial<ShopItem> = {
  name: "",
  description: "",
  price: 100,
  category: "게임시간",
  icon: "🎁",
  is_available: true,
  stock_quantity: null,
};

export default function AdminShopItems() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ShopItem> | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ShopItem | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shop_items")
      .select("*")
      .order("category")
      .order("price");

    if (error) {
      toast.error("아이템을 불러오지 못했어요");
      if (import.meta.env.DEV) console.error(error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    if (!editingItem?.name || !editingItem?.category || !editingItem?.price) {
      toast.error("이름, 카테고리, 가격은 필수입니다");
      return;
    }

    const itemData = {
      name: editingItem.name,
      description: editingItem.description || null,
      price: editingItem.price,
      category: editingItem.category,
      icon: editingItem.icon || null,
      is_available: editingItem.is_available ?? true,
      stock_quantity: editingItem.stock_quantity || null,
    };

    if (editingItem.id) {
      const { error } = await supabase
        .from("shop_items")
        .update(itemData)
        .eq("id", editingItem.id);

      if (error) {
        toast.error("아이템 수정이 잘 안 됐어요");
        if (import.meta.env.DEV) console.error(error);
        return;
      }
      toast.success("아이템이 수정되었습니다");
    } else {
      const { error } = await supabase.from("shop_items").insert(itemData);

      if (error) {
        toast.error("아이템 추가가 잘 안 됐어요");
        if (import.meta.env.DEV) console.error(error);
        return;
      }
      toast.success("새 아이템이 추가되었습니다");
    }

    setDialogOpen(false);
    setEditingItem(null);
    fetchItems();
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const { error } = await supabase
      .from("shop_items")
      .delete()
      .eq("id", itemToDelete.id);

    if (error) {
      toast.error("아이템 삭제가 잘 안 됐어요");
      if (import.meta.env.DEV) console.error(error);
    } else {
      toast.success("아이템이 삭제되었습니다");
      fetchItems();
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleToggleAvailable = async (item: ShopItem) => {
    const { error } = await supabase
      .from("shop_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);

    if (error) {
      toast.error("상태 변경이 잘 안 됐어요");
    } else {
      toast.success(item.is_available ? "아이템이 비공개되었습니다" : "아이템이 공개되었습니다");
      fetchItems();
    }
  };

  const handleDuplicate = async (item: ShopItem) => {
    const { error } = await supabase.from("shop_items").insert({
      name: `${item.name} (복사본)`,
      description: item.description,
      price: item.price,
      category: item.category,
      icon: item.icon,
      is_available: false,
      stock_quantity: item.stock_quantity,
    });

    if (error) {
      toast.error("아이템 복제가 잘 안 됐어요");
    } else {
      toast.success("아이템이 복제되었습니다");
      fetchItems();
    }
  };

  const openAddDialog = () => {
    setEditingItem({ ...defaultItem });
    setDialogOpen(true);
  };

  const openEditDialog = (item: ShopItem) => {
    setEditingItem({ ...item });
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: ShopItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStats = (category: string) => {
    const categoryItems = items.filter((i) => i.category === category);
    return {
      total: categoryItems.length,
      available: categoryItems.filter((i) => i.is_available).length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">상점 아이템 관리</h1>
          <p className="text-muted-foreground mt-1">총 {items.length}개의 아이템</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchItems}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            아이템 추가
          </Button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => {
          const stats = getCategoryStats(cat.value);
          return (
            <Card
              key={cat.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === cat.value ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? "all" : cat.value)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <p className="font-medium text-sm">{cat.label}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.available}/{stats.total} 판매중
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="아이템 이름 또는 설명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Items Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{searchQuery || selectedCategory !== "all" ? "검색 결과가 없습니다" : "등록된 아이템이 없습니다"}</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`group hover:shadow-lg transition-all ${!item.is_available ? "opacity-60" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                    <span className="text-4xl">{item.icon || "🎁"}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleAvailable(item)}>
                        {item.is_available ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            비공개
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            공개
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                        <Copy className="h-4 w-4 mr-2" />
                        복제
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(item)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Coins className="h-4 w-4" />
                    {item.price.toLocaleString()}P
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORIES.find((c) => c.value === item.category)?.emoji} {item.category}
                    </Badge>
                    {!item.is_available && (
                      <Badge variant="secondary" className="text-xs">비공개</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !item.is_available ? "opacity-60" : ""
                  }`}
                >
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                    <span className="text-2xl">{item.icon || "🎁"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {CATEGORIES.find((c) => c.value === item.category)?.emoji} {item.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-600 font-bold min-w-[80px] justify-end">
                    <Coins className="h-4 w-4" />
                    {item.price.toLocaleString()}P
                  </div>
                  <Switch
                    checked={item.is_available}
                    onCheckedChange={() => handleToggleAvailable(item)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(item)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                        <Copy className="h-4 w-4 mr-2" />
                        복제
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(item)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? "아이템 수정" : "새 아이템 추가"}</DialogTitle>
            <DialogDescription>
              상점에서 판매할 아이템을 {editingItem?.id ? "수정" : "추가"}합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <Label>아이콘</Label>
                <Select
                  value={editingItem?.icon || "🎁"}
                  onValueChange={(v) => setEditingItem((prev) => ({ ...prev, icon: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOJI_OPTIONS.map((emoji) => (
                      <SelectItem key={emoji} value={emoji}>
                        {emoji}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label>아이템명 *</Label>
                <Input
                  value={editingItem?.name || ""}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 게임 30분"
                />
              </div>
            </div>
            <div>
              <Label>설명</Label>
              <Textarea
                value={editingItem?.description || ""}
                onChange={(e) => setEditingItem((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="아이템에 대한 상세 설명"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>카테고리 *</Label>
                <Select
                  value={editingItem?.category || "게임시간"}
                  onValueChange={(v) => setEditingItem((prev) => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>가격 (포인트) *</Label>
                <Input
                  type="number"
                  value={editingItem?.price ?? 0}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>재고 수량</Label>
                <Input
                  type="number"
                  value={editingItem?.stock_quantity || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      stock_quantity: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  placeholder="무제한"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingItem?.is_available ?? true}
                    onCheckedChange={(v) => setEditingItem((prev) => ({ ...prev, is_available: v }))}
                  />
                  <Label>판매중</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {editingItem?.id ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>아이템을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{itemToDelete?.name}" 아이템을 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
