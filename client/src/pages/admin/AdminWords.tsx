import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Filter,
  RefreshCw,
  Download,
  Upload,
  Volume2,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

interface EnglishWord {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string | null;
  category: string;
  example_sentence: string | null;
  difficulty: number;
  created_at: string;
}

const CATEGORIES = [
  { value: "동물", label: "동물", emoji: "🐾" },
  { value: "색깔", label: "색깔", emoji: "🌈" },
  { value: "음식", label: "음식", emoji: "🍎" },
  { value: "가족", label: "가족", emoji: "👨‍👩‍👧" },
  { value: "숫자", label: "숫자", emoji: "🔢" },
  { value: "신체", label: "신체", emoji: "🖐️" },
  { value: "학교", label: "학교", emoji: "🏫" },
  { value: "날씨", label: "날씨", emoji: "☀️" },
  { value: "동사", label: "동사", emoji: "🏃" },
  { value: "형용사", label: "형용사", emoji: "✨" },
];

const defaultWord: Partial<EnglishWord> = {
  word: "",
  meaning: "",
  pronunciation: "",
  category: "동물",
  example_sentence: "",
  difficulty: 1,
};

export default function AdminWords() {
  const [words, setWords] = useState<EnglishWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Partial<EnglishWord> | null>(null);
  const [wordToDelete, setWordToDelete] = useState<EnglishWord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("english_words")
      .select("*")
      .order("category")
      .order("word");

    if (error) {
      toast.error("단어를 불러오지 못했어요");
      if (import.meta.env.DEV) console.error(error);
    } else {
      setWords(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleSave = async () => {
    if (!editingWord?.word || !editingWord?.meaning) {
      toast.error("단어와 뜻은 필수입니다");
      return;
    }

    const wordData = {
      word: editingWord.word,
      meaning: editingWord.meaning,
      pronunciation: editingWord.pronunciation || null,
      category: editingWord.category || "동물",
      example_sentence: editingWord.example_sentence || null,
      difficulty: editingWord.difficulty || 1,
    };

    if (editingWord.id) {
      const { error } = await supabase
        .from("english_words")
        .update(wordData)
        .eq("id", editingWord.id);

      if (error) {
        toast.error("단어 수정이 잘 안 됐어요");
        if (import.meta.env.DEV) console.error(error);
        return;
      }
      toast.success("단어가 수정되었습니다");
    } else {
      const { error } = await supabase.from("english_words").insert(wordData);

      if (error) {
        toast.error("단어 추가가 잘 안 됐어요");
        if (import.meta.env.DEV) console.error(error);
        return;
      }
      toast.success("새 단어가 추가되었습니다");
    }

    setDialogOpen(false);
    setEditingWord(null);
    fetchWords();
  };

  const handleDelete = async () => {
    if (!wordToDelete) return;

    const { error } = await supabase
      .from("english_words")
      .delete()
      .eq("id", wordToDelete.id);

    if (error) {
      toast.error("단어 삭제가 잘 안 됐어요");
      if (import.meta.env.DEV) console.error(error);
    } else {
      toast.success("단어가 삭제되었습니다");
      fetchWords();
    }

    setDeleteDialogOpen(false);
    setWordToDelete(null);
  };

  const handleSpeak = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleExportExcel = () => {
    const csvContent = [
      ["단어", "뜻", "발음", "카테고리", "예문", "난이도"].join(","),
      ...words.map(w => [
        w.word,
        w.meaning,
        w.pronunciation || "",
        w.category,
        w.example_sentence || "",
        w.difficulty,
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `english_words_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV 파일이 다운로드되었습니다");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").slice(1); // Skip header
        const newWords: Partial<EnglishWord>[] = [];

        for (const line of lines) {
          if (!line.trim()) continue;
          const [word, meaning, pronunciation, category, example_sentence, difficulty] = line.split(",");
          if (word && meaning) {
            newWords.push({
              word: word.trim(),
              meaning: meaning.trim(),
              pronunciation: pronunciation?.trim() || null,
              category: category?.trim() || "동물",
              example_sentence: example_sentence?.trim() || null,
              difficulty: parseInt(difficulty) || 1,
            });
          }
        }

        if (newWords.length === 0) {
          toast.error("업로드할 단어가 없습니다");
          return;
        }

        const { error } = await supabase.from("english_words").insert(newWords);

        if (error) {
          toast.error("단어 업로드가 잘 안 됐어요: " + error.message);
        } else {
          toast.success(`${newWords.length}개의 단어가 업로드되었습니다`);
          fetchWords();
          setUploadDialogOpen(false);
        }
      } catch (err) {
        toast.error("파일 처리 중 오류가 발생했습니다");
        if (import.meta.env.DEV) console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const openAddDialog = () => {
    setEditingWord({ ...defaultWord });
    setDialogOpen(true);
  };

  const openEditDialog = (word: EnglishWord) => {
    setEditingWord({ ...word });
    setDialogOpen(true);
  };

  const openDeleteDialog = (word: EnglishWord) => {
    setWordToDelete(word);
    setDeleteDialogOpen(true);
  };

  const filteredWords = words.filter((word) => {
    const matchesSearch =
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || word.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStats = (category: string) => {
    return words.filter((w) => w.category === category).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">영어 단어 관리</h1>
          <p className="text-muted-foreground mt-1">총 {words.length}개의 단어</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            CSV 내보내기
          </Button>
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            CSV 업로드
          </Button>
          <Button onClick={openAddDialog} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
            <Plus className="h-4 w-4 mr-2" />
            단어 추가
          </Button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
        {CATEGORIES.map((cat) => {
          const count = getCategoryStats(cat.value);
          return (
            <Card
              key={cat.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === cat.value ? "ring-2 ring-teal-500" : ""
              }`}
              onClick={() => setSelectedCategory(selectedCategory === cat.value ? "all" : cat.value)}
            >
              <CardContent className="p-3 text-center">
                <div className="text-xl mb-1">{cat.emoji}</div>
                <p className="text-xs font-medium">{cat.label}</p>
                <p className="text-xs text-muted-foreground">{count}</p>
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
            placeholder="단어 또는 뜻 검색..."
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
        <Button variant="outline" onClick={fetchWords}>
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* Words Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>단어</TableHead>
                <TableHead>뜻</TableHead>
                <TableHead>발음</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>예문</TableHead>
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
              ) : filteredWords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    {searchQuery || selectedCategory !== "all"
                      ? "검색 결과가 없습니다"
                      : "등록된 단어가 없습니다"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredWords.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSpeak(word.word)}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-lg">{word.word}</span>
                    </TableCell>
                    <TableCell>{word.meaning}</TableCell>
                    <TableCell>
                      {word.pronunciation ? (
                        <span className="text-muted-foreground">[{word.pronunciation}]</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORIES.find((c) => c.value === word.category)?.emoji} {word.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {word.example_sentence ? (
                        <span className="text-sm text-muted-foreground line-clamp-1">
                          {word.example_sentence}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(word)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(word)}
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
            <DialogTitle>{editingWord?.id ? "단어 수정" : "새 단어 추가"}</DialogTitle>
            <DialogDescription>
              영어 단어와 뜻을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>단어 *</Label>
                <Input
                  value={editingWord?.word || ""}
                  onChange={(e) => setEditingWord((prev) => ({ ...prev, word: e.target.value }))}
                  placeholder="apple"
                />
              </div>
              <div>
                <Label>뜻 *</Label>
                <Input
                  value={editingWord?.meaning || ""}
                  onChange={(e) => setEditingWord((prev) => ({ ...prev, meaning: e.target.value }))}
                  placeholder="사과"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>발음</Label>
                <Input
                  value={editingWord?.pronunciation || ""}
                  onChange={(e) => setEditingWord((prev) => ({ ...prev, pronunciation: e.target.value }))}
                  placeholder="애플"
                />
              </div>
              <div>
                <Label>카테고리</Label>
                <Select
                  value={editingWord?.category || "동물"}
                  onValueChange={(v) => setEditingWord((prev) => ({ ...prev, category: v }))}
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
            </div>
            <div>
              <Label>예문</Label>
              <Input
                value={editingWord?.example_sentence || ""}
                onChange={(e) => setEditingWord((prev) => ({ ...prev, example_sentence: e.target.value }))}
                placeholder="I like apples."
              />
            </div>
            <div>
              <Label>난이도 (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={editingWord?.difficulty || 1}
                onChange={(e) => setEditingWord((prev) => ({ ...prev, difficulty: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>
              {editingWord?.id ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CSV 파일 업로드</DialogTitle>
            <DialogDescription>
              CSV 형식의 파일을 업로드하여 단어를 일괄 추가합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium mb-2">CSV 형식:</p>
              <code className="text-xs">단어,뜻,발음,카테고리,예문,난이도</code>
              <p className="text-xs text-muted-foreground mt-2">
                첫 번째 행은 헤더로 인식되어 건너뜁니다.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              파일 선택
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>단어를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              "{wordToDelete?.word}" 단어를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
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
