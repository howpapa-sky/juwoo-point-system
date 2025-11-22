import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleWords = [
  // 동물 (Animals)
  { word: 'cat', meaning: '고양이', category: '동물', pronunciation: 'kæt', difficulty_level: 1 },
  { word: 'dog', meaning: '강아지', category: '동물', pronunciation: 'dɔːɡ', difficulty_level: 1 },
  { word: 'bird', meaning: '새', category: '동물', pronunciation: 'bɜːrd', difficulty_level: 1 },
  { word: 'fish', meaning: '물고기', category: '동물', pronunciation: 'fɪʃ', difficulty_level: 1 },
  { word: 'rabbit', meaning: '토끼', category: '동물', pronunciation: 'ræbɪt', difficulty_level: 1 },
  { word: 'elephant', meaning: '코끼리', category: '동물', pronunciation: 'elɪfənt', difficulty_level: 2 },
  { word: 'lion', meaning: '사자', category: '동물', pronunciation: 'laɪən', difficulty_level: 1 },
  { word: 'tiger', meaning: '호랑이', category: '동물', pronunciation: 'taɪɡər', difficulty_level: 1 },
  
  // 과일 (Fruits)
  { word: 'apple', meaning: '사과', category: '과일', pronunciation: 'æpl', difficulty_level: 1 },
  { word: 'banana', meaning: '바나나', category: '과일', pronunciation: 'bənænə', difficulty_level: 1 },
  { word: 'orange', meaning: '오렌지', category: '과일', pronunciation: 'ɔːrɪndʒ', difficulty_level: 1 },
  { word: 'grape', meaning: '포도', category: '과일', pronunciation: 'ɡreɪp', difficulty_level: 1 },
  { word: 'strawberry', meaning: '딸기', category: '과일', pronunciation: 'strɔːberi', difficulty_level: 2 },
  { word: 'watermelon', meaning: '수박', category: '과일', pronunciation: 'wɔːtərmelən', difficulty_level: 2 },
  
  // 색깔 (Colors)
  { word: 'red', meaning: '빨강', category: '색깔', pronunciation: 'red', difficulty_level: 1 },
  { word: 'blue', meaning: '파랑', category: '색깔', pronunciation: 'bluː', difficulty_level: 1 },
  { word: 'yellow', meaning: '노랑', category: '색깔', pronunciation: 'jeloʊ', difficulty_level: 1 },
  { word: 'green', meaning: '초록', category: '색깔', pronunciation: 'ɡriːn', difficulty_level: 1 },
  { word: 'pink', meaning: '분홍', category: '색깔', pronunciation: 'pɪŋk', difficulty_level: 1 },
  { word: 'purple', meaning: '보라', category: '색깔', pronunciation: 'pɜːrpl', difficulty_level: 1 },
  
  // 숫자 (Numbers)
  { word: 'one', meaning: '하나', category: '숫자', pronunciation: 'wʌn', difficulty_level: 1 },
  { word: 'two', meaning: '둘', category: '숫자', pronunciation: 'tuː', difficulty_level: 1 },
  { word: 'three', meaning: '셋', category: '숫자', pronunciation: 'θriː', difficulty_level: 1 },
  { word: 'four', meaning: '넷', category: '숫자', pronunciation: 'fɔːr', difficulty_level: 1 },
  { word: 'five', meaning: '다섯', category: '숫자', pronunciation: 'faɪv', difficulty_level: 1 },
  { word: 'six', meaning: '여섯', category: '숫자', pronunciation: 'sɪks', difficulty_level: 1 },
  { word: 'seven', meaning: '일곱', category: '숫자', pronunciation: 'sevn', difficulty_level: 1 },
  { word: 'eight', meaning: '여덟', category: '숫자', pronunciation: 'eɪt', difficulty_level: 1 },
  { word: 'nine', meaning: '아홉', category: '숫자', pronunciation: 'naɪn', difficulty_level: 1 },
  { word: 'ten', meaning: '열', category: '숫자', pronunciation: 'ten', difficulty_level: 1 },
  
  // 가족 (Family)
  { word: 'mom', meaning: '엄마', category: '가족', pronunciation: 'mɑːm', difficulty_level: 1 },
  { word: 'dad', meaning: '아빠', category: '가족', pronunciation: 'dæd', difficulty_level: 1 },
  { word: 'brother', meaning: '형/오빠/남동생', category: '가족', pronunciation: 'brʌðər', difficulty_level: 1 },
  { word: 'sister', meaning: '언니/누나/여동생', category: '가족', pronunciation: 'sɪstər', difficulty_level: 1 },
  { word: 'baby', meaning: '아기', category: '가족', pronunciation: 'beɪbi', difficulty_level: 1 },
];

async function addWords() {
  console.log('📚 샘플 단어 추가 시작...\n');
  
  const { data, error } = await supabase
    .from('english_words')
    .insert(sampleWords)
    .select();
  
  if (error) {
    console.error('❌ 오류:', error);
    return;
  }
  
  console.log(`✅ ${data.length}개 단어 추가 완료!\n`);
  console.log('카테고리별 단어 수:');
  const categories = {};
  sampleWords.forEach(w => {
    categories[w.category] = (categories[w.category] || 0) + 1;
  });
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}개`);
  });
}

addWords();
