import { useState, useEffect } from "react";
import { Link } from "wouter";
import { hasQuizForBook, getQuizzesByBook } from "@/data/quizData";

// Book interface (booksData removed in Phase 1)
interface Book {
  id: string;
  title: string;
  author: string;
  coverEmoji: string;
  description: string;
  category: string;
  difficulty: string;
  readTime: string;
  pages: string[];
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Eye,
  BookOpen,
  FileText,
  Gamepad2,
  Clock,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "공략집", label: "공략집", emoji: "🎮" },
  { value: "동화", label: "동화", emoji: "🧚" },
];

const DIFFICULTIES = [
  { value: "쉬움", label: "쉬움", emoji: "🌱" },
  { value: "보통", label: "보통", emoji: "⭐" },
  { value: "어려움", label: "어려움", emoji: "🔥" },
];

const EMOJI_OPTIONS = ["📘", "📕", "📗", "📙", "📚", "🎮", "⚔️", "🐉", "🔥", "⚡", "🌟", "💎", "🏆", "🎯", "🧚", "🦋"];

interface EditingBook {
  id?: string;
  title: string;
  author: string;
  coverEmoji: string;
  description: string;
  category: string;
  difficulty: string;
  readTime: string;
  pages: string[];
}

const defaultBook: EditingBook = {
  title: "",
  author: "아빠",
  coverEmoji: "📘",
  description: "",
  category: "공략집",
  difficulty: "쉬움",
  readTime: "5분",
  pages: [""],
};

export default function AdminEbooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<EditingBook | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [previewPage, setPreviewPage] = useState(0);
  const [currentEditPage, setCurrentEditPage] = useState(0);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStats = (category: string) => {
    const categoryBooks = books.filter((b) => b.category === category);
    return {
      total: categoryBooks.length,
      withQuiz: categoryBooks.filter((b) => hasQuizForBook(b.id)).length,
    };
  };

  const openAddDialog = () => {
    setEditingBook({ ...defaultBook, pages: [""] });
    setCurrentEditPage(0);
    setDialogOpen(true);
  };

  const openEditDialog = (book: Book) => {
    setEditingBook({
      id: book.id,
      title: book.title,
      author: book.author,
      coverEmoji: book.coverEmoji,
      description: book.description,
      category: book.category,
      difficulty: book.difficulty,
      readTime: book.readTime,
      pages: [...book.pages],
    });
    setCurrentEditPage(0);
    setDialogOpen(true);
  };

  const openPreview = (book: Book) => {
    setPreviewBook(book);
    setPreviewPage(0);
    setPreviewOpen(true);
  };

  const handleSave = () => {
    if (!editingBook?.title || !editingBook?.pages.some(p => p.trim())) {
      toast.error("제목과 최소 1페이지 내용이 필요합니다");
      return;
    }

    // In a real implementation, this would save to database
    toast.success(editingBook.id ? "e북이 수정되었습니다" : "새 e북이 추가되었습니다");
    toast.info("참고: 현재는 DB 연동이 필요합니다");
    setDialogOpen(false);
    setEditingBook(null);
  };

  const addPage = () => {
    if (!editingBook) return;
    setEditingBook({
      ...editingBook,
      pages: [...editingBook.pages, ""],
    });
    setCurrentEditPage(editingBook.pages.length);
  };

  const removePage = (index: number) => {
    if (!editingBook || editingBook.pages.length <= 1) return;
    const newPages = editingBook.pages.filter((_, i) => i !== index);
    setEditingBook({
      ...editingBook,
      pages: newPages,
    });
    if (currentEditPage >= newPages.length) {
      setCurrentEditPage(newPages.length - 1);
    }
  };

  const updatePage = (index: number, content: string) => {
    if (!editingBook) return;
    const newPages = [...editingBook.pages];
    newPages[index] = content;
    setEditingBook({
      ...editingBook,
      pages: newPages,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">e북 관리</h1>
          <p className="text-muted-foreground mt-1">총 {books.length}권의 e북</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            e북 추가
          </Button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const stats = getCategoryStats(cat.value);
          return (
            <Card
              key={cat.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === cat.value ? "ring-2 ring-purple-500" : ""
              }`}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? "all" : cat.value)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <p className="font-medium text-sm">{cat.label}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.total}권 (퀴즈 {stats.withQuiz})
                </p>
              </CardContent>
            </Card>
          );
        })}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1">📊</div>
            <p className="font-medium text-sm">전체 페이지</p>
            <p className="text-xs text-muted-foreground">
              {books.reduce((sum, b) => sum + b.pages.length, 0)}페이지
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1">🎮</div>
            <p className="font-medium text-sm">퀴즈 연동</p>
            <p className="text-xs text-muted-foreground">
              {books.filter(b => hasQuizForBook(b.id)).length}권
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="e북 제목 또는 설명 검색..."
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

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="group hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                  <span className="text-4xl">{book.coverEmoji}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openPreview(book)}>
                      <Eye className="h-4 w-4 mr-2" />
                      미리보기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(book)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      복제
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="font-bold text-lg mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">by {book.author}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {book.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-xs">
                  {CATEGORIES.find((c) => c.value === book.category)?.emoji} {book.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {DIFFICULTIES.find((d) => d.value === book.difficulty)?.emoji} {book.difficulty}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-3 border-t text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {book.pages.length}페이지
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {book.readTime}
                </div>
                {hasQuizForBook(book.id) && (
                  <div className="flex items-center gap-1 text-purple-600">
                    <Gamepad2 className="h-4 w-4" />
                    퀴즈
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{searchQuery || selectedCategory !== "all" ? "검색 결과가 없습니다" : "등록된 e북이 없습니다"}</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingBook?.id ? "e북 수정" : "새 e북 추가"}</DialogTitle>
            <DialogDescription>
              e북 정보와 페이지 내용을 입력하세요.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">기본 정보</TabsTrigger>
              <TabsTrigger value="pages">페이지 편집 ({editingBook?.pages.length ?? 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="flex-1 overflow-auto space-y-4 p-1">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label>표지 이모지</Label>
                  <Select
                    value={editingBook?.coverEmoji || "📘"}
                    onValueChange={(v) => setEditingBook((prev) => prev ? { ...prev, coverEmoji: v } : null)}
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
                  <Label>제목 *</Label>
                  <Input
                    value={editingBook?.title || ""}
                    onChange={(e) => setEditingBook((prev) => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="e북 제목"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>저자</Label>
                  <Input
                    value={editingBook?.author || ""}
                    onChange={(e) => setEditingBook((prev) => prev ? { ...prev, author: e.target.value } : null)}
                    placeholder="아빠"
                  />
                </div>
                <div>
                  <Label>읽기 시간</Label>
                  <Input
                    value={editingBook?.readTime || ""}
                    onChange={(e) => setEditingBook((prev) => prev ? { ...prev, readTime: e.target.value } : null)}
                    placeholder="5분"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>카테고리</Label>
                  <Select
                    value={editingBook?.category || "공략집"}
                    onValueChange={(v) => setEditingBook((prev) => prev ? { ...prev, category: v } : null)}
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
                  <Label>난이도</Label>
                  <Select
                    value={editingBook?.difficulty || "쉬움"}
                    onValueChange={(v) => setEditingBook((prev) => prev ? { ...prev, difficulty: v } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.emoji} {diff.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>설명</Label>
                <Textarea
                  value={editingBook?.description || ""}
                  onChange={(e) => setEditingBook((prev) => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="e북에 대한 간단한 설명"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="pages" className="flex-1 overflow-hidden flex flex-col p-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 flex-1">
                  {editingBook?.pages.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentEditPage === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentEditPage(index)}
                      className="min-w-[40px]"
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addPage}>
                  <Plus className="h-4 w-4 mr-1" />
                  페이지 추가
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>페이지 {currentEditPage + 1} 내용</Label>
                  {(editingBook?.pages.length ?? 0) > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePage(currentEditPage)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  )}
                </div>
                <Textarea
                  value={editingBook?.pages[currentEditPage] || ""}
                  onChange={(e) => updatePage(currentEditPage, e.target.value)}
                  placeholder="페이지 내용을 입력하세요..."
                  className="flex-1 min-h-[300px] font-mono"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {editingBook?.id ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{previewBook?.coverEmoji}</span>
              {previewBook?.title}
            </DialogTitle>
            <DialogDescription>
              페이지 {previewPage + 1} / {previewBook?.pages.length}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-[300px] p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {previewBook?.pages[previewPage]}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setPreviewPage(Math.max(0, previewPage - 1))}
              disabled={previewPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              이전
            </Button>
            <span className="text-sm text-muted-foreground">
              {previewPage + 1} / {previewBook?.pages.length}
            </span>
            <Button
              variant="outline"
              onClick={() => setPreviewPage(Math.min((previewBook?.pages.length || 1) - 1, previewPage + 1))}
              disabled={previewPage === (previewBook?.pages.length || 1) - 1}
            >
              다음
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
