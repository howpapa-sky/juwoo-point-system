import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vqxuavqpevllzzgkpudp.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeHVhdnFwZXZsbHp6Z2twdWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3MjQwOTMsImV4cCI6MjA0NzMwMDA5M30.ZcCNXYFPLDZkHdT7Bh9Vy9DxW7xkBvOxdOEOTtJCzfE';

export const supabase = createClient(supabaseUrl, supabaseKey);

const JUWOO_ID = 1;

// User functions
export async function upsertUser(user: any) {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      open_id: user.openId,
      name: user.name,
      email: user.email,
      login_method: user.loginMethod,
      role: user.role || 'user',
      last_signed_in: new Date().toISOString(),
    }, {
      onConflict: 'open_id',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserByOpenId(openId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('open_id', openId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function updateUserRole(userId: number, role: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Juwoo profile functions
export async function getJuwooProfile() {
  const { data, error } = await supabase
    .from('juwoo_profile')
    .select('*')
    .eq('id', JUWOO_ID)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getJuwooBalance() {
  const profile = await getJuwooProfile();
  return profile?.current_points || 0;
}

export async function updateJuwooBalance(newBalance: number) {
  const { data, error } = await supabase
    .from('juwoo_profile')
    .update({ 
      current_points: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', JUWOO_ID)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Point rules functions
export async function getAllPointRules() {
  const { data, error } = await supabase
    .from('point_rules')
    .select('*')
    .order('category', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function getPointRuleById(id: number) {
  const { data, error } = await supabase
    .from('point_rules')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createPointRule(rule: {
  name: string;
  description?: string;
  category: string;
  pointAmount: number;
}) {
  const { data, error } = await supabase
    .from('point_rules')
    .insert({
      name: rule.name,
      description: rule.description,
      category: rule.category,
      point_amount: rule.pointAmount,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Point transactions functions
export async function addPointTransaction(transaction: {
  ruleId?: number;
  amount: number;
  note?: string;
  createdBy?: number;
}) {
  const currentBalance = await getJuwooBalance();
  const newBalance = currentBalance + transaction.amount;
  
  const { data, error } = await supabase
    .from('point_transactions')
    .insert({
      juwoo_id: JUWOO_ID,
      rule_id: transaction.ruleId,
      amount: transaction.amount,
      balance_after: newBalance,
      note: transaction.note,
      created_by: transaction.createdBy,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  await updateJuwooBalance(newBalance);
  
  return data;
}

export async function getJuwooTransactions(limit: number = 50) {
  const { data, error } = await supabase
    .from('point_transactions')
    .select(`
      *,
      point_rules (name, category),
      users (name)
    `)
    .eq('juwoo_id', JUWOO_ID)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function cancelTransaction(transactionId: number) {
  const { data: transaction, error: fetchError } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('id', transactionId)
    .single();
  
  if (fetchError) throw fetchError;
  if (!transaction) throw new Error('Transaction not found');
  
  const reverseAmount = -transaction.amount;
  const currentBalance = await getJuwooBalance();
  const newBalance = currentBalance + reverseAmount;
  
  const { data, error } = await supabase
    .from('point_transactions')
    .insert({
      juwoo_id: JUWOO_ID,
      amount: reverseAmount,
      balance_after: newBalance,
      note: `취소: ${transaction.note || 'ID ' + transactionId}`,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  await updateJuwooBalance(newBalance);
  
  return data;
}

// Shop items functions
export async function getAllShopItems() {
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .eq('is_available', true)
    .order('category', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function getShopItemById(id: number) {
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createShopItem(item: any) {
  const { data, error } = await supabase
    .from('shop_items')
    .insert(item)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Purchase functions
export async function createPurchase(purchase: {
  itemId: number;
  pointCost: number;
  note?: string;
}) {
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      juwoo_id: JUWOO_ID,
      item_id: purchase.itemId,
      point_cost: purchase.pointCost,
      note: purchase.note,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getJuwooPurchases() {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      shop_items (name, category)
    `)
    .eq('juwoo_id', JUWOO_ID)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getPendingPurchases() {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      shop_items (name, category, point_cost)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function approvePurchase(purchaseId: number, adminId: number) {
  const { data: purchase, error: fetchError } = await supabase
    .from('purchases')
    .select('*')
    .eq('id', purchaseId)
    .single();
  
  if (fetchError) throw fetchError;
  if (!purchase) throw new Error('Purchase not found');
  
  const currentBalance = await getJuwooBalance();
  const newBalance = currentBalance - purchase.point_cost;
  
  if (newBalance < 0) {
    throw new Error('Insufficient points');
  }
  
  const { data, error } = await supabase
    .from('purchases')
    .update({
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', purchaseId)
    .select()
    .single();
  
  if (error) throw error;
  
  await addPointTransaction({
    amount: -purchase.point_cost,
    note: `구매: ${purchase.note || 'ID ' + purchaseId}`,
    createdBy: adminId,
  });
  
  return data;
}

export async function rejectPurchase(purchaseId: number, adminId: number) {
  const { data, error } = await supabase
    .from('purchases')
    .update({
      status: 'rejected',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', purchaseId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Statistics functions
export async function getDailyStats(days: number = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('juwoo_id', JUWOO_ID)
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  const dailyMap = new Map<string, { earned: number; spent: number }>();
  
  (data || []).forEach(t => {
    const date = new Date(t.created_at).toISOString().split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { earned: 0, spent: 0 });
    }
    const stats = dailyMap.get(date)!;
    if (t.amount > 0) {
      stats.earned += t.amount;
    } else {
      stats.spent += Math.abs(t.amount);
    }
  });
  
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const stats = dailyMap.get(dateStr) || { earned: 0, spent: 0 };
    result.push({
      date: dateStr,
      earned: stats.earned,
      spent: stats.spent,
    });
  }
  
  return result;
}

export async function getCategoryStats() {
  const { data, error } = await supabase
    .from('point_transactions')
    .select(`
      amount,
      point_rules (category)
    `)
    .eq('juwoo_id', JUWOO_ID)
    .gt('amount', 0);
  
  if (error) throw error;
  
  const categoryMap = new Map<string, number>();
  
  (data || []).forEach((t: any) => {
    const category = t.point_rules?.category || '기타';
    categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
  });
  
  const result = Array.from(categoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
  
  return result;
}

export async function getJuwooStats() {
  const balance = await getJuwooBalance();
  const transactions = await getJuwooTransactions(1000);
  
  const totalEarned = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalSpent = Math.abs(transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0));
  
  return {
    currentBalance: balance,
    totalEarned,
    totalSpent,
    transactionCount: transactions.length,
  };
}

// English learning functions
export async function getRandomEnglishWord(level: number = 1) {
  const { data, error } = await supabase
    .from('english_words')
    .select('*')
    .eq('level', level)
    .limit(100);
  
  if (error) throw error;
  if (!data || data.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export async function checkEnglishAnswer(wordId: number, userAnswer: string) {
  const { data, error } = await supabase
    .from('english_words')
    .select('*')
    .eq('id', wordId)
    .single();
  
  if (error) throw error;
  if (!data) return false;
  
  return data.word.toLowerCase() === userAnswer.toLowerCase();
}
