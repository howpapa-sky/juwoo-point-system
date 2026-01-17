import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import {
  Medal,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Users,
  Coins,
  BookOpen,
  Flame,
  Star,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeData {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  points_required: number | null;
  category: "points" | "learning" | "streak" | "special";
  earned_count?: number;
}

type BadgeCategory = "all" | "points" | "learning" | "streak" | "special";

const CATEGORIES: { value: BadgeCategory; label: string; icon: React.ElementType; color: string }[] = [
  { value: "all", label: "전체", icon: Medal, color: "bg-gray-100 text-gray-700" },
  { value: "points", label: "포인트", icon: Coins, color: "bg-amber-100 text-amber-700" },
  { value: "learning", label: "학습", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  { value: "streak", label: "연속", icon: Flame, color: "bg-orange-100 text-orange-700" },
  { value: "special", label: "특별", icon: Star, color: "bg-purple-100 text-purple-700" },
];

const EMOJI_OPTIONS = [
  "🏆", "🥇", "🥈", "🥉", "🎖️", "🏅", "⭐", "🌟", "✨", "💎",
  "👑", "🎯", "🔥", "💪", "🚀", "📚", "📖", "✏️", "🎓", "🧠",
  "💡", "🎨", "🎮", "🎲", "🎪", "🎁", "🎉", "🎊", "❤️", "💯",
];

const DEFAULT_BADGE: Omit<BadgeData, "id" | "earned_count"> = {
  name: "",
  description: "",
  icon: "🏆",
  requirement: "",
  points_required: null,
  category: "points",
};

export default function AdminBadges() {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory>("all");

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const [formData, setFormData] = useState(DEFAULT_BADGE);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch badges
  const fetchBadges = async () => {
    setLoading(true);
    try {
      const { data: badgesData, error } = await supabase
        .from("badges")
        .select("*")
        .order("category")
        .order("points_required", { ascending: true, nullsFirst: true });

      if (error) throw error;

      // Get earned counts for each badge
      const { data: earnedData } = await supabase
        .from("user_badges")
        .select("badge_id");

      const earnedCounts: Record<number, number> = {};
      (earnedData || []).forEach((ub) => {
        earnedCounts[ub.badge_id] = (earnedCounts[ub.badge_id] || 0) + 1;
      });

      const badgesWithCounts = (badgesData || []).map((b) => ({
        ...b,
        earned_count: earnedCounts[b.id] || 0,
      }));

      setBadges(badgesWithCounts);
    } catch (error) {
      console.error("Error fetching badges:", error);
      toast.error("배지를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  // Filter badges
  const filteredBadges = badges.filter((badge) => {
    const matchesSearch =
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || badge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Category stats
  const categoryStats = CATEGORIES.map((cat) => ({
    ...cat,
    count: cat.value === "all"
      ? badges.length
      : badges.filter((b) => b.category === cat.value).length,
  }));

  // Handle create
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("배지 이름을 입력해주세요");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("badges").insert({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        requirement: formData.requirement,
        points_required: formData.points_required,
        category: formData.category,
      });

      if (error) throw error;

      toast.success("배지가 생성되었습니다");
      setIsCreateDialogOpen(false);
      setFormData(DEFAULT_BADGE);
      fetchBadges();
    } catch (error) {
      console.error("Error creating badge:", error);
      toast.error("배지 생성에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit
  const handleEdit = async () => {
    if (!selectedBadge || !formData.name.trim()) {
      toast.error("배지 이름을 입력해주세요");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("badges")
        .update({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          requirement: formData.requirement,
          points_required: formData.points_required,
          category: formData.category,
        })
        .eq("id", selectedBadge.id);

      if (error) throw error;

      toast.success("배지가 수정되었습니다");
      setIsEditDialogOpen(false);
      setSelectedBadge(null);
      fetchBadges();
    } catch (error) {
      console.error("Error updating badge:", error);
      toast.error("배지 수정에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedBadge) return;

    try {
      // First delete related user_badges
      await supabase.from("user_badges").delete().eq("badge_id", selectedBadge.id);

      const { error } = await supabase.from("badges").delete().eq("id", selectedBadge.id);

      if (error) throw error;

      toast.success("배지가 삭제되었습니다");
      setIsDeleteDialogOpen(false);
      setSelectedBadge(null);
      fetchBadges();
    } catch (error) {
      console.error("Error deleting badge:", error);
      toast.error("배지 삭제에 실패했습니다");
    }
  };

  // Handle duplicate
  const handleDuplicate = async (badge: BadgeData) => {
    try {
      const { error } = await supabase.from("badges").insert({
        name: `${badge.name} (복사본)`,
        description: badge.description,
        icon: badge.icon,
        requirement: badge.requirement,
        points_required: badge.points_required,
        category: badge.category,
      });

      if (error) throw error;

      toast.success("배지가 복제되었습니다");
      fetchBadges();
    } catch (error) {
      console.error("Error duplicating badge:", error);
      toast.error("배지 복제에 실패했습니다");
    }
  };

  // Open edit dialog
  const openEditDialog = (badge: BadgeData) => {
    setSelectedBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      requirement: badge.requirement,
      points_required: badge.points_required,
      category: badge.category,
    });
    setIsEditDialogOpen(true);
  };

  // Get category info
  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find((c) => c.value === category) || CATEGORIES[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Medal className="h-7 w-7 text-amber-500" />
            배지 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            성취 배지를 관리하고 새로운 배지를 추가하세요
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          새 배지 추가
        </Button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categoryStats.map((cat) => (
          <Card
            key={cat.value}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedCategory === cat.value && "ring-2 ring-amber-500"
            )}
            onClick={() => setSelectedCategory(cat.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", cat.color)}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold">{cat.count}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{cat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="배지 이름 또는 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Badges Table */}
      <Card>
        <CardHeader>
          <CardTitle>배지 목록</CardTitle>
          <CardDescription>
            총 {filteredBadges.length}개의 배지
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto" />
              <p className="mt-2 text-muted-foreground">불러오는 중...</p>
            </div>
          ) : filteredBadges.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">배지가 없습니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">아이콘</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead className="hidden md:table-cell">설명</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead className="text-right">필요 포인트</TableHead>
                    <TableHead className="text-center">획득자</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBadges.map((badge) => {
                    const catInfo = getCategoryInfo(badge.category);
                    return (
                      <TableRow key={badge.id}>
                        <TableCell>
                          <span className="text-3xl">{badge.icon}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{badge.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {badge.description.slice(0, 30)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs">
                          <p className="truncate">{badge.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {badge.requirement}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(catInfo.color)}>
                            {catInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {badge.points_required !== null
                            ? `${badge.points_required.toLocaleString()}P`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{badge.earned_count}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(badge)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(badge)}>
                                <Copy className="h-4 w-4 mr-2" />
                                복제
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBadge(badge);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>새 배지 추가</DialogTitle>
            <DialogDescription>
              새로운 성취 배지를 추가합니다
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>아이콘</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={cn(
                      "text-2xl p-1 rounded hover:bg-gray-100 transition-colors",
                      formData.icon === emoji && "bg-amber-100 ring-2 ring-amber-500"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">배지 이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 첫 포인트 달성"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="배지에 대한 설명..."
                rows={2}
              />
            </div>

            {/* Requirement */}
            <div className="space-y-2">
              <Label htmlFor="requirement">획득 조건</Label>
              <Input
                id="requirement"
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                placeholder="예: 처음으로 포인트를 획득하세요"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as BadgeData["category"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Points Required */}
            <div className="space-y-2">
              <Label htmlFor="points_required">필요 포인트 (선택)</Label>
              <Input
                id="points_required"
                type="number"
                value={formData.points_required ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points_required: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="자동 획득이 아닌 경우 비워두세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? "생성 중..." : "생성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>배지 수정</DialogTitle>
            <DialogDescription>배지 정보를 수정합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>아이콘</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={cn(
                      "text-2xl p-1 rounded hover:bg-gray-100 transition-colors",
                      formData.icon === emoji && "bg-amber-100 ring-2 ring-amber-500"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">배지 이름 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">설명</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Requirement */}
            <div className="space-y-2">
              <Label htmlFor="edit-requirement">획득 조건</Label>
              <Input
                id="edit-requirement"
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as BadgeData["category"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Points Required */}
            <div className="space-y-2">
              <Label htmlFor="edit-points_required">필요 포인트 (선택)</Label>
              <Input
                id="edit-points_required"
                type="number"
                value={formData.points_required ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points_required: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>배지 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-3xl block mb-2">{selectedBadge?.icon}</span>
              "{selectedBadge?.name}" 배지를 삭제하시겠습니까?
              <br />
              이 배지를 획득한 모든 기록도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
