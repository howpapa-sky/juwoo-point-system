import { useState } from "react";
import { booksData } from "@/data/booksData";
import { getAllQuizzes, getQuizzesByBook, QuizQuestion, QuizTier, TIER_INFO } from "@/data/quizData";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  Copy,
  Filter,
  RefreshCw,
  Gamepad2,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

const QUESTION_TYPES = [
  { value: "multiple-choice", label: "객관식", emoji: "🔢" },
  { value: "true-false", label: "O/X", emoji: "⭕" },
  { value: "text-input", label: "주관식", emoji: "✍️" },
  { value: "fill-blank", label: "빈칸채우기", emoji: "📝" },
];

const TIERS: { value: QuizTier; label: string; emoji: string; color: string }[] = [
  { value: "basic", label: "기초", emoji: "🌱", color: "bg-green-100 text-green-700" },
  { value: "intermediate", label: "실력", emoji: "⭐", color: "bg-blue-100 text-blue-700" },
  { value: "master", label: "마스터", emoji: "👑", color: "bg-purple-100 text-purple-700" },
];

interface EditingQuiz {
  id?: string;
  bookId: string;
  tier: QuizTier;
  questionType: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hints: { type: string; content: string; pageReference?: number }[];
  basePoints: number;
}

const defaultQuiz: EditingQuiz = {
  bookId: "",
  tier: "basic",
  questionType: "multiple-choice",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  hints: [],
  basePoints: 10,
};

export default function AdminQuizzes() {
  const allQuizzes = getAllQuizzes();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<EditingQuiz | null>(null);
  const [previewQuiz, setPreviewQuiz] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const booksWithQuiz = booksData.filter(b => getQuizzesByBook(b.id).length > 0);

  const filteredQuizzes = allQuizzes.filter((quiz) => {
    const matchesSearch = quiz.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBook = selectedBook === "all" || quiz.bookId === selectedBook;
    const matchesTier = selectedTier === "all" || quiz.quizTier === selectedTier;
    return matchesSearch && matchesBook && matchesTier;
  });

  const getQuizStats = () => {
    return {
      total: allQuizzes.length,
      basic: allQuizzes.filter(q => q.quizTier === "basic").length,
      intermediate: allQuizzes.filter(q => q.quizTier === "intermediate").length,
      master: allQuizzes.filter(q => q.quizTier === "master").length,
    };
  };

  const stats = getQuizStats();

  const openAddDialog = () => {
    setEditingQuiz({ ...defaultQuiz, bookId: booksWithQuiz[0]?.id || "" });
    setDialogOpen(true);
  };

  const openEditDialog = (quiz: QuizQuestion) => {
    setEditingQuiz({
      id: quiz.id,
      bookId: quiz.bookId,
      tier: quiz.quizTier,
      questionType: quiz.type,
      question: quiz.question,
      options: quiz.options || ["", "", "", ""],
      correctAnswer: quiz.correctAnswer,
      hints: quiz.hints?.map(h => ({ type: "text", content: h.text, pageReference: undefined })) || [],
      basePoints: quiz.points,
    });
    setDialogOpen(true);
  };

  const openPreview = (quiz: QuizQuestion) => {
    setPreviewQuiz(quiz);
    setSelectedAnswer(null);
    setPreviewOpen(true);
  };

  const handleSave = () => {
    if (!editingQuiz?.question || !editingQuiz?.correctAnswer) {
      toast.error("문제와 정답은 필수입니다");
      return;
    }

    toast.success(editingQuiz.id ? "퀴즈가 수정되었습니다" : "새 퀴즈가 추가되었습니다");
    toast.info("참고: 현재는 quizData 파일을 직접 수정해야 합니다");
    setDialogOpen(false);
    setEditingQuiz(null);
  };

  const updateOption = (index: number, value: string) => {
    if (!editingQuiz) return;
    const newOptions = [...editingQuiz.options];
    newOptions[index] = value;
    setEditingQuiz({ ...editingQuiz, options: newOptions });
  };

  const addHint = () => {
    if (!editingQuiz) return;
    setEditingQuiz({
      ...editingQuiz,
      hints: [...editingQuiz.hints, { type: "text", content: "" }],
    });
  };

  const updateHint = (index: number, field: string, value: string | number) => {
    if (!editingQuiz) return;
    const newHints = [...editingQuiz.hints];
    newHints[index] = { ...newHints[index], [field]: value };
    setEditingQuiz({ ...editingQuiz, hints: newHints });
  };

  const removeHint = (index: number) => {
    if (!editingQuiz) return;
    setEditingQuiz({
      ...editingQuiz,
      hints: editingQuiz.hints.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">퀴즈 관리</h1>
          <p className="text-muted-foreground mt-1">총 {allQuizzes.length}개의 퀴즈 문제</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
            <Plus className="h-4 w-4 mr-2" />
            퀴즈 추가
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-1">🎮</div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">전체 문제</p>
          </CardContent>
        </Card>
        {TIERS.map((tier) => (
          <Card key={tier.value}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">{tier.emoji}</div>
              <p className="text-2xl font-bold">{stats[tier.value]}</p>
              <p className="text-xs text-muted-foreground">{tier.label} 문제</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="문제 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedBook} onValueChange={setSelectedBook}>
          <SelectTrigger className="w-[200px]">
            <BookOpen className="h-4 w-4 mr-2" />
            <SelectValue placeholder="e북 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 e북</SelectItem>
            {booksWithQuiz.map((book) => (
              <SelectItem key={book.id} value={book.id}>
                {book.coverEmoji} {book.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTier} onValueChange={setSelectedTier}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="난이도" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 난이도</SelectItem>
            {TIERS.map((tier) => (
              <SelectItem key={tier.value} value={tier.value}>
                {tier.emoji} {tier.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quizzes Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">유형</TableHead>
                <TableHead>문제</TableHead>
                <TableHead>e북</TableHead>
                <TableHead className="text-center">난이도</TableHead>
                <TableHead className="text-center">힌트</TableHead>
                <TableHead className="text-center">포인트</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Gamepad2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {searchQuery || selectedBook !== "all" || selectedTier !== "all"
                      ? "검색 결과가 없습니다"
                      : "등록된 퀴즈가 없습니다"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuizzes.map((quiz) => {
                  const book = booksData.find(b => b.id === quiz.bookId);
                  const tierInfo = TIERS.find(t => t.value === quiz.quizTier);
                  const typeInfo = QUESTION_TYPES.find(t => t.value === quiz.type);

                  return (
                    <TableRow key={quiz.id}>
                      <TableCell>
                        <span className="text-xl" title={typeInfo?.label}>
                          {typeInfo?.emoji || "❓"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium line-clamp-1">{quiz.question}</p>
                        {quiz.options && (
                          <p className="text-xs text-muted-foreground">
                            보기 {quiz.options.length}개 | 정답: {quiz.correctAnswer}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{book?.coverEmoji}</span>
                          <span className="text-sm truncate max-w-[100px]">{book?.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={tierInfo?.color}>
                          {tierInfo?.emoji} {tierInfo?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {quiz.hints.length > 0 ? (
                          <Badge variant="outline">{quiz.hints.length}개</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {quiz.points}P
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPreview(quiz)}>
                              <Eye className="h-4 w-4 mr-2" />
                              미리보기
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(quiz)}>
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
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingQuiz?.id ? "퀴즈 수정" : "새 퀴즈 추가"}</DialogTitle>
            <DialogDescription>
              퀴즈 문제와 정답, 힌트를 설정하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>e북</Label>
                <Select
                  value={editingQuiz?.bookId || ""}
                  onValueChange={(v) => setEditingQuiz((prev) => prev ? { ...prev, bookId: v } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="e북 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {booksData.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.coverEmoji} {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>난이도</Label>
                <Select
                  value={editingQuiz?.tier || "basic"}
                  onValueChange={(v) => setEditingQuiz((prev) => prev ? { ...prev, tier: v as QuizTier } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIERS.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.emoji} {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>문제 유형</Label>
                <Select
                  value={editingQuiz?.questionType || "multiple-choice"}
                  onValueChange={(v) => setEditingQuiz((prev) => prev ? { ...prev, questionType: v } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>문제 *</Label>
              <Textarea
                value={editingQuiz?.question || ""}
                onChange={(e) => setEditingQuiz((prev) => prev ? { ...prev, question: e.target.value } : null)}
                placeholder="문제를 입력하세요"
                rows={2}
              />
            </div>

            {editingQuiz?.questionType === "multiple-choice" && (
              <div className="space-y-2">
                <Label>보기 (정답에 체크)</Label>
                {editingQuiz.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={editingQuiz.correctAnswer === option}
                      onChange={() => setEditingQuiz((prev) => prev ? { ...prev, correctAnswer: option } : null)}
                      className="h-4 w-4"
                    />
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`보기 ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {editingQuiz?.questionType === "true-false" && (
              <div>
                <Label>정답</Label>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant={editingQuiz.correctAnswer === "O" ? "default" : "outline"}
                    onClick={() => setEditingQuiz((prev) => prev ? { ...prev, correctAnswer: "O" } : null)}
                  >
                    ⭕ O (맞음)
                  </Button>
                  <Button
                    variant={editingQuiz.correctAnswer === "X" ? "default" : "outline"}
                    onClick={() => setEditingQuiz((prev) => prev ? { ...prev, correctAnswer: "X" } : null)}
                  >
                    ❌ X (틀림)
                  </Button>
                </div>
              </div>
            )}

            {(editingQuiz?.questionType === "text-input" || editingQuiz?.questionType === "fill-blank") && (
              <div>
                <Label>정답 *</Label>
                <Input
                  value={editingQuiz?.correctAnswer || ""}
                  onChange={(e) => setEditingQuiz((prev) => prev ? { ...prev, correctAnswer: e.target.value } : null)}
                  placeholder="정답을 입력하세요"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>기본 포인트</Label>
                <Input
                  type="number"
                  value={editingQuiz?.basePoints || 10}
                  onChange={(e) => setEditingQuiz((prev) => prev ? { ...prev, basePoints: parseInt(e.target.value) || 10 } : null)}
                />
              </div>
            </div>

            {/* Hints Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>힌트 (포인트 10% 감소/개)</Label>
                <Button variant="outline" size="sm" onClick={addHint}>
                  <Plus className="h-4 w-4 mr-1" />
                  힌트 추가
                </Button>
              </div>
              {editingQuiz?.hints.map((hint, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-600 mt-1" />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={hint.content}
                      onChange={(e) => updateHint(index, "content", e.target.value)}
                      placeholder="힌트 내용"
                    />
                    <div className="flex gap-2">
                      <Select
                        value={hint.type}
                        onValueChange={(v) => updateHint(index, "type", v)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">텍스트</SelectItem>
                          <SelectItem value="page">페이지 참조</SelectItem>
                          <SelectItem value="eliminate">오답 제거</SelectItem>
                        </SelectContent>
                      </Select>
                      {hint.type === "page" && (
                        <Input
                          type="number"
                          placeholder="페이지 번호"
                          className="w-24"
                          value={hint.pageReference || ""}
                          onChange={(e) => updateHint(index, "pageReference", parseInt(e.target.value))}
                        />
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeHint(index)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {editingQuiz?.id ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              퀴즈 미리보기
            </DialogTitle>
          </DialogHeader>

          {previewQuiz && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={TIERS.find(t => t.value === previewQuiz.quizTier)?.color}>
                  {TIERS.find(t => t.value === previewQuiz.quizTier)?.emoji}{" "}
                  {TIERS.find(t => t.value === previewQuiz.quizTier)?.label}
                </Badge>
                <Badge variant="outline">
                  {QUESTION_TYPES.find(t => t.value === previewQuiz.type)?.emoji}{" "}
                  {QUESTION_TYPES.find(t => t.value === previewQuiz.type)?.label}
                </Badge>
                <Badge variant="secondary">{previewQuiz.points}P</Badge>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-lg font-medium">{previewQuiz.question}</p>
              </div>

              {previewQuiz.options && (
                <div className="space-y-2">
                  {previewQuiz.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        selectedAnswer === option
                          ? option === previewQuiz.correctAnswer
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedAnswer === option && (
                          option === previewQuiz.correctAnswer
                            ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                            : <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {previewQuiz.hints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">힌트 ({previewQuiz.hints.length}개)</p>
                  {previewQuiz.hints.map((hint, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{hint.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
