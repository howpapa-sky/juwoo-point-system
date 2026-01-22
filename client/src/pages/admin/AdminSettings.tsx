import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Palette, Bell, Shield, Database, Download, Upload,
  RefreshCw, Save, Trash2, AlertTriangle, CheckCircle2, Info,
  Moon, Sun, Monitor, Volume2, VolumeX, Zap, Gift, Target,
  Clock, Calendar, Users, Coins, Star, Award, Sparkles,
  Lock, Unlock, Eye, EyeOff, HardDrive, Cloud, FileJson,
  RotateCcw, History, Archive, Smartphone, Globe, Languages,
  Heart, Brain, Gamepad2, BookOpen, TrendingUp, BarChart3
} from "lucide-react";

// 설정 인터페이스
interface SystemSettings {
  // 일반 설정
  appName: string;
  childName: string;
  currency: string;
  language: string;
  timezone: string;

  // 포인트 설정
  dailyPointLimit: number;
  weeklyPointLimit: number;
  bonusMultiplier: number;
  streakBonusEnabled: boolean;
  streakBonusThreshold: number;
  streakBonusAmount: number;

  // 학습 설정
  dailyWordGoal: number;
  quizPassingScore: number;
  hintPenaltyPercent: number;
  maxHintsPerQuestion: number;
  flashcardAutoAdvance: boolean;
  flashcardAutoAdvanceDelay: number;

  // 알림 설정
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  achievementNotifications: boolean;
  streakWarningEnabled: boolean;

  // 테마 설정
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';

  // 보안 설정
  requirePasswordForPurchase: boolean;
  purchaseConfirmation: boolean;
  maxPurchaseAmount: number;
  sessionTimeout: number;

  // 데이터 설정
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  dataRetentionDays: number;
}

const defaultSettings: SystemSettings = {
  appName: "주우 포인트 시스템",
  childName: "주우",
  currency: "P",
  language: "ko",
  timezone: "Asia/Seoul",

  dailyPointLimit: 500,
  weeklyPointLimit: 2000,
  bonusMultiplier: 1.0,
  streakBonusEnabled: true,
  streakBonusThreshold: 7,
  streakBonusAmount: 50,

  dailyWordGoal: 10,
  quizPassingScore: 60,
  hintPenaltyPercent: 10,
  maxHintsPerQuestion: 3,
  flashcardAutoAdvance: true,
  flashcardAutoAdvanceDelay: 3,

  notificationsEnabled: true,
  soundEnabled: true,
  dailyReminderEnabled: true,
  dailyReminderTime: "18:00",
  achievementNotifications: true,
  streakWarningEnabled: true,

  theme: 'system',
  primaryColor: '#8b5cf6',
  animationsEnabled: true,
  reducedMotion: false,
  fontSize: 'medium',

  requirePasswordForPurchase: false,
  purchaseConfirmation: true,
  maxPurchaseAmount: 1000,
  sessionTimeout: 30,

  autoBackup: true,
  backupFrequency: 'weekly',
  dataRetentionDays: 365,
};

const COLOR_PRESETS = [
  { name: "퍼플", value: "#8b5cf6", gradient: "from-purple-500 to-violet-500" },
  { name: "핑크", value: "#ec4899", gradient: "from-pink-500 to-rose-500" },
  { name: "블루", value: "#3b82f6", gradient: "from-blue-500 to-cyan-500" },
  { name: "그린", value: "#22c55e", gradient: "from-green-500 to-emerald-500" },
  { name: "오렌지", value: "#f59e0b", gradient: "from-orange-500 to-amber-500" },
  { name: "레드", value: "#ef4444", gradient: "from-red-500 to-rose-500" },
];

export default function AdminSettings() {
  const { user, signOut } = useSupabaseAuth();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // 통계 데이터
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalPoints: 0,
    totalBadges: 0,
    totalWords: 0,
    lastBackup: null as Date | null,
    storageUsed: "0 MB",
  });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      // localStorage에서 설정 로드 (실제 앱에서는 Supabase에서 로드)
      const savedSettings = localStorage.getItem('juwoo-settings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const [txRes, badgesRes, wordsRes] = await Promise.all([
        supabase.from('point_transactions').select('id, amount', { count: 'exact' }),
        supabase.from('user_badges').select('id', { count: 'exact' }),
        supabase.from('english_learning_progress').select('id', { count: 'exact' }),
      ]);

      const totalPoints = txRes.data?.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0) || 0;

      setStats({
        totalTransactions: txRes.count || 0,
        totalPoints,
        totalBadges: badgesRes.count || 0,
        totalWords: wordsRes.count || 0,
        lastBackup: new Date(),
        storageUsed: `${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB`,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  function updateSetting<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  async function saveSettings() {
    setSaving(true);
    try {
      localStorage.setItem('juwoo-settings', JSON.stringify(settings));
      setHasChanges(false);
      toast.success('설정이 저장되었습니다!');
    } catch (error) {
      toast.error('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  function resetSettings() {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      setSettings(defaultSettings);
      setHasChanges(true);
      toast.info('설정이 초기화되었습니다.');
    }
  }

  async function exportData() {
    try {
      const [txRes, badgesRes, goalsRes, quizRes, learningRes] = await Promise.all([
        supabase.from('point_transactions').select('*'),
        supabase.from('user_badges').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('ebook_quiz_progress').select('*'),
        supabase.from('english_learning_progress').select('*'),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        settings,
        transactions: txRes.data,
        badges: badgesRes.data,
        goals: goalsRes.data,
        quizProgress: quizRes.data,
        learningProgress: learningRes.data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `juwoo-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('데이터가 내보내기되었습니다!');
    } catch (error) {
      toast.error('데이터 내보내기에 실패했습니다.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            시스템 설정
          </h1>
          <p className="text-muted-foreground mt-1">
            주우 포인트 시스템의 모든 설정을 관리하세요
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              저장되지 않은 변경사항
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={resetSettings}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            초기화
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || saving}
            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            저장
          </Button>
        </div>
      </div>

      {/* 설정 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full bg-white dark:bg-gray-800 shadow-lg p-1 rounded-xl">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">일반</span>
          </TabsTrigger>
          <TabsTrigger value="points" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Coins className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">포인트</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Brain className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">학습</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Bell className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">알림</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Palette className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">테마</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Database className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">데이터</span>
          </TabsTrigger>
        </TabsList>

        {/* 일반 설정 */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                기본 설정
              </CardTitle>
              <CardDescription className="text-white/80">
                앱의 기본 정보를 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">앱 이름</Label>
                  <Input
                    id="appName"
                    value={settings.appName}
                    onChange={(e) => updateSetting('appName', e.target.value)}
                    placeholder="앱 이름을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childName">아이 이름</Label>
                  <Input
                    id="childName"
                    value={settings.childName}
                    onChange={(e) => updateSetting('childName', e.target.value)}
                    placeholder="아이 이름을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">포인트 단위</Label>
                  <Select value={settings.currency} onValueChange={(v) => updateSetting('currency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P">P (포인트)</SelectItem>
                      <SelectItem value="점">점</SelectItem>
                      <SelectItem value="코인">코인</SelectItem>
                      <SelectItem value="스타">스타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">언어</Label>
                  <Select value={settings.language} onValueChange={(v) => updateSetting('language', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                보안 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>구매 시 비밀번호 확인</Label>
                  <p className="text-sm text-muted-foreground">
                    상점에서 아이템 구매 시 비밀번호를 요청합니다
                  </p>
                </div>
                <Switch
                  checked={settings.requirePasswordForPurchase}
                  onCheckedChange={(v) => updateSetting('requirePasswordForPurchase', v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>구매 확인 대화상자</Label>
                  <p className="text-sm text-muted-foreground">
                    구매 전 확인 대화상자를 표시합니다
                  </p>
                </div>
                <Switch
                  checked={settings.purchaseConfirmation}
                  onCheckedChange={(v) => updateSetting('purchaseConfirmation', v)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>최대 구매 금액 제한</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  한 번에 구매할 수 있는 최대 포인트: {settings.maxPurchaseAmount}P
                </p>
                <Slider
                  value={[settings.maxPurchaseAmount]}
                  onValueChange={([v]) => updateSetting('maxPurchaseAmount', v)}
                  max={5000}
                  min={100}
                  step={100}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 포인트 설정 */}
        <TabsContent value="points" className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                포인트 시스템
              </CardTitle>
              <CardDescription className="text-white/80">
                포인트 적립 및 사용 규칙을 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>일일 포인트 제한</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    하루에 적립 가능한 최대 포인트: {settings.dailyPointLimit}P
                  </p>
                  <Slider
                    value={[settings.dailyPointLimit]}
                    onValueChange={([v]) => updateSetting('dailyPointLimit', v)}
                    max={2000}
                    min={100}
                    step={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label>주간 포인트 제한</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    일주일에 적립 가능한 최대 포인트: {settings.weeklyPointLimit}P
                  </p>
                  <Slider
                    value={[settings.weeklyPointLimit]}
                    onValueChange={([v]) => updateSetting('weeklyPointLimit', v)}
                    max={10000}
                    min={500}
                    step={100}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      연속 활동 보너스
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      연속으로 활동하면 보너스 포인트를 지급합니다
                    </p>
                  </div>
                  <Switch
                    checked={settings.streakBonusEnabled}
                    onCheckedChange={(v) => updateSetting('streakBonusEnabled', v)}
                  />
                </div>

                {settings.streakBonusEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid md:grid-cols-2 gap-4 pl-6 border-l-2 border-yellow-300"
                  >
                    <div className="space-y-2">
                      <Label>보너스 기준 일수</Label>
                      <Input
                        type="number"
                        value={settings.streakBonusThreshold}
                        onChange={(e) => updateSetting('streakBonusThreshold', parseInt(e.target.value))}
                        min={1}
                        max={30}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>보너스 포인트</Label>
                      <Input
                        type="number"
                        value={settings.streakBonusAmount}
                        onChange={(e) => updateSetting('streakBonusAmount', parseInt(e.target.value))}
                        min={1}
                        max={500}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>보너스 배수</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  모든 포인트에 적용되는 배수: x{settings.bonusMultiplier.toFixed(1)}
                </p>
                <Slider
                  value={[settings.bonusMultiplier * 10]}
                  onValueChange={([v]) => updateSetting('bonusMultiplier', v / 10)}
                  max={30}
                  min={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>x1.0</span>
                  <span>x2.0</span>
                  <span>x3.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 학습 설정 */}
        <TabsContent value="learning" className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                학습 설정
              </CardTitle>
              <CardDescription className="text-white/80">
                영어 학습 및 퀴즈 관련 설정
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    일일 단어 목표
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    하루 학습 목표: {settings.dailyWordGoal}개
                  </p>
                  <Slider
                    value={[settings.dailyWordGoal]}
                    onValueChange={([v]) => updateSetting('dailyWordGoal', v)}
                    max={50}
                    min={5}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-pink-500" />
                    퀴즈 통과 점수
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    통과 기준: {settings.quizPassingScore}%
                  </p>
                  <Slider
                    value={[settings.quizPassingScore]}
                    onValueChange={([v]) => updateSetting('quizPassingScore', v)}
                    max={100}
                    min={40}
                    step={5}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>힌트 사용 시 점수 감소</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    힌트당 감소: {settings.hintPenaltyPercent}%
                  </p>
                  <Slider
                    value={[settings.hintPenaltyPercent]}
                    onValueChange={([v]) => updateSetting('hintPenaltyPercent', v)}
                    max={50}
                    min={0}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>문제당 최대 힌트 수</Label>
                  <Input
                    type="number"
                    value={settings.maxHintsPerQuestion}
                    onChange={(e) => updateSetting('maxHintsPerQuestion', parseInt(e.target.value))}
                    min={1}
                    max={9}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-500" />
                      플래시카드 자동 넘김
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      정답 후 자동으로 다음 카드로 이동
                    </p>
                  </div>
                  <Switch
                    checked={settings.flashcardAutoAdvance}
                    onCheckedChange={(v) => updateSetting('flashcardAutoAdvance', v)}
                  />
                </div>

                {settings.flashcardAutoAdvance && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pl-6 border-l-2 border-purple-300"
                  >
                    <div className="space-y-2">
                      <Label>자동 넘김 대기 시간</Label>
                      <p className="text-sm text-muted-foreground mb-2">
                        {settings.flashcardAutoAdvanceDelay}초 후 자동 넘김
                      </p>
                      <Slider
                        value={[settings.flashcardAutoAdvanceDelay]}
                        onValueChange={([v]) => updateSetting('flashcardAutoAdvanceDelay', v)}
                        max={10}
                        min={1}
                        step={1}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 알림 설정 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림 설정
              </CardTitle>
              <CardDescription className="text-white/80">
                알림 및 소리 설정
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    알림 활성화
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    앱 내 알림을 표시합니다
                  </p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(v) => updateSetting('notificationsEnabled', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    {settings.soundEnabled ? <Volume2 className="h-4 w-4 text-green-500" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
                    효과음
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    포인트 획득, 정답 등의 효과음
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(v) => updateSetting('soundEnabled', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    업적 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    배지 획득 시 알림을 표시합니다
                  </p>
                </div>
                <Switch
                  checked={settings.achievementNotifications}
                  onCheckedChange={(v) => updateSetting('achievementNotifications', v)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      일일 학습 알림
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      매일 지정된 시간에 학습 알림
                    </p>
                  </div>
                  <Switch
                    checked={settings.dailyReminderEnabled}
                    onCheckedChange={(v) => updateSetting('dailyReminderEnabled', v)}
                  />
                </div>

                {settings.dailyReminderEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pl-6 border-l-2 border-orange-300"
                  >
                    <div className="space-y-2">
                      <Label>알림 시간</Label>
                      <Input
                        type="time"
                        value={settings.dailyReminderTime}
                        onChange={(e) => updateSetting('dailyReminderTime', e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    연속 학습 경고
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    연속 학습이 끊어질 위험이 있을 때 알림
                  </p>
                </div>
                <Switch
                  checked={settings.streakWarningEnabled}
                  onCheckedChange={(v) => updateSetting('streakWarningEnabled', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 테마 설정 */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                외관 설정
              </CardTitle>
              <CardDescription className="text-white/80">
                앱의 테마와 스타일 설정
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Label>테마 모드</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: '라이트', icon: Sun },
                    { value: 'dark', label: '다크', icon: Moon },
                    { value: 'system', label: '시스템', icon: Monitor },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSetting('theme', option.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === option.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <option.icon className={`h-8 w-8 mx-auto mb-2 ${
                        settings.theme === option.value ? 'text-purple-500' : 'text-gray-400'
                      }`} />
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>메인 색상</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateSetting('primaryColor', color.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        settings.primaryColor === color.value
                          ? 'border-gray-800 dark:border-white shadow-lg scale-105'
                          : 'border-transparent hover:scale-105'
                      }`}
                    >
                      <div className={`h-10 w-10 mx-auto rounded-full bg-gradient-to-r ${color.gradient}`} />
                      <div className="text-xs font-medium mt-2">{color.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>글자 크기</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'small', label: '작게', size: 'text-sm' },
                    { value: 'medium', label: '보통', size: 'text-base' },
                    { value: 'large', label: '크게', size: 'text-lg' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSetting('fontSize', option.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.fontSize === option.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className={`${option.size} font-medium`}>가나다</div>
                      <div className="text-xs text-muted-foreground mt-1">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    애니메이션
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    UI 애니메이션 효과를 사용합니다
                  </p>
                </div>
                <Switch
                  checked={settings.animationsEnabled}
                  onCheckedChange={(v) => updateSetting('animationsEnabled', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>모션 감소</Label>
                  <p className="text-sm text-muted-foreground">
                    움직임에 민감한 경우 활성화하세요
                  </p>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(v) => updateSetting('reducedMotion', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 데이터 설정 */}
        <TabsContent value="data" className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
              <CardContent className="p-4">
                <Database className="h-6 w-6 mb-2 opacity-80" />
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                <div className="text-sm opacity-80">총 거래</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
              <CardContent className="p-4">
                <Coins className="h-6 w-6 mb-2 opacity-80" />
                <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
                <div className="text-sm opacity-80">총 적립</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-violet-500 text-white border-0">
              <CardContent className="p-4">
                <Award className="h-6 w-6 mb-2 opacity-80" />
                <div className="text-2xl font-bold">{stats.totalBadges}</div>
                <div className="text-sm opacity-80">배지</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="p-4">
                <HardDrive className="h-6 w-6 mb-2 opacity-80" />
                <div className="text-2xl font-bold">{stats.storageUsed}</div>
                <div className="text-sm opacity-80">저장 용량</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                데이터 관리
              </CardTitle>
              <CardDescription className="text-white/80">
                데이터 백업 및 복원
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-blue-500" />
                    자동 백업
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    데이터를 자동으로 백업합니다
                  </p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(v) => updateSetting('autoBackup', v)}
                />
              </div>

              {settings.autoBackup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pl-6 border-l-2 border-blue-300"
                >
                  <div className="space-y-2">
                    <Label>백업 주기</Label>
                    <Select
                      value={settings.backupFrequency}
                      onValueChange={(v) => updateSetting('backupFrequency', v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">매일</SelectItem>
                        <SelectItem value="weekly">매주</SelectItem>
                        <SelectItem value="monthly">매월</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>데이터 보관 기간</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {settings.dataRetentionDays}일간 데이터를 보관합니다
                </p>
                <Slider
                  value={[settings.dataRetentionDays]}
                  onValueChange={([v]) => updateSetting('dataRetentionDays', v)}
                  max={730}
                  min={30}
                  step={30}
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="gap-2" onClick={exportData}>
                  <Download className="h-4 w-4" />
                  데이터 내보내기
                </Button>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  데이터 가져오기
                </Button>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <div>
                    <div className="font-medium text-red-800">위험 구역</div>
                    <p className="text-sm text-red-600">
                      모든 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                    </p>
                  </div>
                </div>
                <Button variant="destructive" className="mt-4 gap-2">
                  <Trash2 className="h-4 w-4" />
                  모든 데이터 삭제
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 최근 백업 정보 */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-gray-500" />
                백업 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.lastBackup ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">마지막 백업</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.lastBackup.toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      성공
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Archive className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>백업 기록이 없습니다</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
