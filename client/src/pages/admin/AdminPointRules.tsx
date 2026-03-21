import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  GripVertical,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface PointRule {
  id: number;
  name: string;
  description: string | null;
  points: number;
  category: string;
  icon: string | null;
  is_active: boolean;
  daily_limit: number | null;
  display_order: number | null;
  created_at: string;
}

const CATEGORIES = [
  { value: "생활습관", label: "생활습관", emoji: "🌅" },
  { value: "운동건강", label: "운동건강", emoji: "💪" },
  { value: "학습독서", label: "학습독서", emoji: "📚" },
  { value: "예의태도", label: "예의태도", emoji: "🙏" },
  { value: "집안일", label: "집안일", emoji: "🏠" },
  { value: "부정행동", label: "부정행동", emoji: "⚠️" },
];

const EMOJI_OPTIONS = ["🌅", "💪", "📚", "🙏", "🏠", "⚠️", "⭐", "🎯", "🎮", "🎁", "🌟", "🏆", "✨", "💎", "🔥", "❤️"];

const defaultRule: Partial<PointRule> = {
  name: "",
  description: "",
  points: 10,
  category: "생활습관",
  icon: "⭐",
  is_active: true,
  daily_limit: null,
};

export default function AdminPointRules() {
  const [rules, setRules] = useState<PointRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<PointRule> | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<PointRule | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("point_rules")
      .select("*")
      .order("category")
      .order("display_order", { nullsFirst: false })
      .order("id");

    if (error) {
      toast.error("규칙을 불러오지 못했어요");
      if (import.meta.env.DEV) console.error(error);
    } else {
      setRules(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSave = async () => {
    if (!editingRule?.name || !editingRule?.category) {
      toast.error("이름과 카테고리는 필수입니다");
      return;
    }

    const ruleData = {
      name: editingRule.name,
      description: editingRule.description || null,
      points: editingRule.points ?? 0,
      category: editingRule.category,
      icon: editingRule.icon || null,
      is_active: editingRule.is_active ?? true,
      daily_limit: editingRule.daily_limit || null,
    };

    if (editingRule.id) {
      // Update
      const { error } = await supabase
        .from("point_rules")
        .update(ruleData)
        .eq("id", editingRule.id);

      if (error) {
        toast.error("규칙 수정이 잘 안 됐어요");
        if (import.meta.env.DEV) console.error(error);
        return;
      }
      toast.success("규칙이 수정되었습니다");
    } else {
      // Create
      const { error } = await supabase.from("point_rules").insert(ruleData);

      if (error) {
        toast.error("규칙 추가가 잘 안 됐어요");
        if (import.meta.env.DEV) console.error(error);
        return;
      }
      toast.success("새 규칙이 추가되었습니다");
    }

    setDialogOpen(false);
    setEditingRule(null);
    fetchRules();
  };

  const handleDelete = async () => {
    if (!ruleToDelete) return;

    const { error } = await supabase
      .from("point_rules")
      .delete()
      .eq("id", ruleToDelete.id);

    if (error) {
      toast.error("규칙 삭제가 잘 안 됐어요");
      if (import.meta.env.DEV) console.error(error);
    } else {
      toast.success("규칙이 삭제되었습니다");
      fetchRules();
    }

    setDeleteDialogOpen(false);
    setRuleToDelete(null);
  };

  const handleToggleActive = async (rule: PointRule) => {
    const { error } = await supabase
      .from("point_rules")
      .update({ is_active: !rule.is_active })
      .eq("id", rule.id);

    if (error) {
      toast.error("상태 변경이 잘 안 됐어요");
    } else {
      toast.success(rule.is_active ? "규칙이 비활성화되었습니다" : "규칙이 활성화되었습니다");
      fetchRules();
    }
  };

  const handleDuplicate = async (rule: PointRule) => {
    const { error } = await supabase.from("point_rules").insert({
      name: `${rule.name} (복사본)`,
      description: rule.description,
      points: rule.points,
      category: rule.category,
      icon: rule.icon,
      is_active: false,
      daily_limit: rule.daily_limit,
    });

    if (error) {
      toast.error("규칙 복제가 잘 안 됐어요");
    } else {
      toast.success("규칙이 복제되었습니다");
      fetchRules();
    }
  };

  const openAddDialog = () => {
    setEditingRule({ ...defaultRule });
    setDialogOpen(true);
  };

  const openEditDialog = (rule: PointRule) => {
    setEditingRule({ ...rule });
    setDialogOpen(true);
  };

  const openDeleteDialog = (rule: PointRule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || rule.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStats = (category: string) => {
    const categoryRules = rules.filter((r) => r.category === category);
    return {
      total: categoryRules.length,
      active: categoryRules.filter((r) => r.is_active).length,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">포인트 규칙 관리</h1>
          <p className="text-muted-foreground mt-1">총 {rules.length}개의 규칙</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRules}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            규칙 추가
          </Button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => {
          const stats = getCategoryStats(cat.value);
          return (
            <Card
              key={cat.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === cat.value ? "ring-2 ring-amber-500" : ""
              }`}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? "all" : cat.value)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <p className="font-medium text-sm">{cat.label}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.active}/{stats.total} 활성
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
            placeholder="규칙 이름 또는 설명 검색..."
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
      </div>

      {/* Rules Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>규칙명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead className="text-right">포인트</TableHead>
                <TableHead className="text-center">일일 제한</TableHead>
                <TableHead className="text-center">상태</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery || selectedCategory !== "all"
                      ? "검색 결과가 없습니다"
                      : "등록된 규칙이 없습니다"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id} className={!rule.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rule.icon || "⭐"}</span>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          {rule.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {rule.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORIES.find((c) => c.value === rule.category)?.emoji} {rule.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-mono font-bold ${
                          rule.points >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {rule.points >= 0 ? "+" : ""}{rule.points}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {rule.daily_limit ? (
                        <Badge variant="secondary">{rule.daily_limit}회</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggleActive(rule)}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(rule)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(rule)}>
                            <Copy className="h-4 w-4 mr-2" />
                            복제
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(rule)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule?.id ? "규칙 수정" : "새 규칙 추가"}</DialogTitle>
            <DialogDescription>
              포인트 적립/차감 규칙을 {editingRule?.id ? "수정" : "추가"}합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <Label>아이콘</Label>
                <Select
                  value={editingRule?.icon || "⭐"}
                  onValueChange={(v) => setEditingRule((prev) => ({ ...prev, icon: v }))}
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
                <Label>규칙명 *</Label>
                <Input
                  value={editingRule?.name || ""}
                  onChange={(e) => setEditingRule((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 일찍 일어나기"
                />
              </div>
            </div>
            <div>
              <Label>설명</Label>
              <Input
                value={editingRule?.description || ""}
                onChange={(e) => setEditingRule((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="규칙에 대한 상세 설명"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>카테고리 *</Label>
                <Select
                  value={editingRule?.category || "생활습관"}
                  onValueChange={(v) => setEditingRule((prev) => ({ ...prev, category: v }))}
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
                <Label>포인트</Label>
                <Input
                  type="number"
                  value={editingRule?.points ?? 0}
                  onChange={(e) =>
                    setEditingRule((prev) => ({ ...prev, points: parseInt(e.target.value) || 0 }))
                  }
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground mt-1">음수 입력 시 차감</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>일일 제한</Label>
                <Input
                  type="number"
                  value={editingRule?.daily_limit || ""}
                  onChange={(e) =>
                    setEditingRule((prev) => ({
                      ...prev,
                      daily_limit: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  placeholder="무제한"
                />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingRule?.is_active ?? true}
                    onCheckedChange={(v) => setEditingRule((prev) => ({ ...prev, is_active: v }))}
                  />
                  <Label>활성화</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {editingRule?.id ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>규칙을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{ruleToDelete?.name}" 규칙을 삭제합니다. 이 작업은 되돌릴 수 없습니다.
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
