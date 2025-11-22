#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 마크다운 테이블 파싱 함수
function parseMarkdownTable(content) {
  const lines = content.split('\n');
  const data = [];
  let headers = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 테이블 헤더 찾기
    if (line.startsWith('|') && !line.includes('---')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      
      // 다음 줄이 구분선인지 확인
      if (i + 1 < lines.length && lines[i + 1].includes('---')) {
        headers = cells;
        i++; // 구분선 건너뛰기
        continue;
      }
      
      // 데이터 행 파싱
      if (headers.length > 0) {
        const row = {};
        cells.forEach((cell, index) => {
          if (index < headers.length) {
            const header = headers[index].toLowerCase().replace(/\s+/g, '_');
            row[header] = cell;
          }
        });
        data.push(row);
      }
    }
  }
  
  return data;
}

// 포인트 규칙 변환 함수
function convertPointRules(rawData) {
  return rawData
    .map(row => ({
      name: row['행동'] || row['name'],
      description: row['설명'] || row['description'],
      category: row['카테고리'] || '생활습관',
      point_amount: parseInt(row['포인트'] || row['point_amount'] || 0),
      is_active: true
    }))
    .filter(item => item.name && item.name.trim() !== ''); // null 값 필터링
}

// 상점 아이템 변환 함수
function convertShopItems(rawData) {
  return rawData
    .map(row => ({
      name: row['아이템'] || row['상품명'] || row['name'],
      description: row['설명'] || row['description'],
      category: row['카테고리'] || '간식음식',
      point_cost: parseInt(row['필요_포인트'] || row['가격'] || row['point_cost'] || 0),
      is_available: true
    }))
    .filter(item => item.name && item.name.trim() !== ''); // null 값 필터링
}

// 영어 단어 변환 함수
function convertEnglishWords(rawData) {
  return rawData
    .map(row => ({
      word: row['영어'] || row['word'],
      korean: row['한글'] || row['korean'],
      category: row['카테고리'] || '동물',
      example_sentence: row['예문'] || row['example_sentence'] || `I see a ${row['영어'] || row['word']}.`
    }))
    .filter(item => item.word && item.word.trim() !== ''); // null 값 필터링
}

// 배지 변환 함수
function convertBadges(rawData) {
  return rawData
    .map(row => ({
      name: row['배지_이름'] || row['배지명'] || row['name'],
      description: row['설명'] || row['description'],
      category: row['조건_타입'] || row['카테고리'] || '학습',
      requirement: parseInt(row['조건_값'] || row['조건'] || row['requirement'] || 0),
      icon: row['아이콘'] || row['icon'] || '🏆'
    }))
    .filter(item => item.name && item.name.trim() !== ''); // null 값 필터링
}

// 데이터 삽입 함수
async function insertData(tableName, data, description) {
  console.log(`\n📝 Inserting ${data.length} ${description}...`);
  
  if (data.length === 0) {
    console.warn(`⚠️  Warning: No data to insert for ${description}`);
    return [];
  }
  
  // 기존 데이터 삭제
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .neq('id', 0); // 모든 행 삭제 (id != 0은 항상 true)
  
  if (deleteError) {
    console.warn(`⚠️  Warning: Could not delete existing data from ${tableName}:`, deleteError.message);
  }
  
  // 새 데이터 삽입
  const { data: insertedData, error: insertError } = await supabase
    .from(tableName)
    .insert(data)
    .select();
  
  if (insertError) {
    console.error(`❌ Error inserting ${description}:`, insertError.message);
    console.error('Sample data:', data[0]);
    throw insertError;
  }
  
  console.log(`✅ Successfully inserted ${insertedData.length} ${description}`);
  return insertedData;
}

// 메인 함수
async function main() {
  try {
    console.log('🚀 Starting Supabase data seeding...\n');
    console.log(`📍 Supabase URL: ${supabaseUrl}`);
    
    // 1. 포인트 규칙 삽입
    const pointRulesContent = readFileSync(join(projectRoot, 'POINT_RULES_DATA.md'), 'utf-8');
    const pointRulesRaw = parseMarkdownTable(pointRulesContent);
    console.log(`📋 Parsed ${pointRulesRaw.length} raw point rules`);
    const pointRules = convertPointRules(pointRulesRaw);
    console.log(`✅ Converted ${pointRules.length} valid point rules`);
    if (pointRules.length > 0) {
      console.log('Sample point rule:', pointRules[0]);
    }
    await insertData('point_rules', pointRules, 'point rules');
    
    // 2. 상점 아이템 삽입
    const shopItemsContent = readFileSync(join(projectRoot, 'SHOP_ITEMS_DATA.md'), 'utf-8');
    const shopItemsRaw = parseMarkdownTable(shopItemsContent);
    const shopItems = convertShopItems(shopItemsRaw);
    await insertData('shop_items', shopItems, 'shop items');
    
    // 3. 영어 단어 삽입
    const englishWordsContent = readFileSync(join(projectRoot, 'ENGLISH_WORDS_DATA.md'), 'utf-8');
    const englishWordsRaw = parseMarkdownTable(englishWordsContent);
    const englishWords = convertEnglishWords(englishWordsRaw);
    await insertData('english_words', englishWords, 'English words');
    
    // 4. 배지 삽입
    const badgesContent = readFileSync(join(projectRoot, 'BADGES_DATA.md'), 'utf-8');
    const badgesRaw = parseMarkdownTable(badgesContent);
    const badges = convertBadges(badgesRaw);
    await insertData('badges', badges, 'badges');
    
    console.log('\n🎉 All data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Point rules: ${pointRules.length}`);
    console.log(`  - Shop items: ${shopItems.length}`);
    console.log(`  - English words: ${englishWords.length}`);
    console.log(`  - Badges: ${badges.length}`);
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
