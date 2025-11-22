import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleWords = [
  // 동물
  { word: 'cat', meaning: '고양이', category: '동물', pronunciation: 'kæt' },
  { word: 'dog', meaning: '강아지', category: '동물', pronunciation: 'dɔːɡ' },
  { word: 'bird', meaning: '새', category: '동물', pronunciation: 'bɜːrd' },
  { word: 'fish', meaning: '물고기', category: '동물', pronunciation: 'fɪʃ' },
  { word: 'rabbit', meaning: '토끼', category: '동물', pronunciation: 'ræbɪt' },
  { word: 'elephant', meaning: '코끼리', category: '동물', pronunciation: 'elɪfənt' },
  { word: 'lion', meaning: '사자', category: '동물', pronunciation: 'laɪən' },
  { word: 'tiger', meaning: '호랑이', category: '동물', pronunciation: 'taɪɡər' },
  
  // 과일
  { word: 'apple', meaning: '사과', category: '과일', pronunciation: 'æpl' },
  { word: 'banana', meaning: '바나나', category: '과일', pronunciation: 'bənænə' },
  { word: 'orange', meaning: '오렌지', category: '과일', pronunciation: 'ɔːrɪndʒ' },
  { word: 'grape', meaning: '포도', category: '과일', pronunciation: 'ɡreɪp' },
  { word: 'strawberry', meaning: '딸기', category: '과일', pronunciation: 'strɔːberi' },
  { word: 'watermelon', meaning: '수박', category: '과일', pronunciation: 'wɔːtərmelən' },
  
  // 색깔
  { word: 'red', meaning: '빨강', category: '색깔', pronunciation: 'red' },
  { word: 'blue', meaning: '파랑', category: '색깔', pronunciation: 'bluː' },
  { word: 'yellow', meaning: '노랑', category: '색깔', pronunciation: 'jeloʊ' },
  { word: 'green', meaning: '초록', category: '색깔', pronunciation: 'ɡriːn' },
  { word: 'pink', meaning: '분홍', category: '색깔', pronunciation: 'pɪŋk' },
  { word: 'purple', meaning: '보라', category: '색깔', pronunciation: 'pɜːrpl' },
  
  // 숫자
  { word: 'one', meaning: '하나', category: '숫자', pronunciation: 'wʌn' },
  { word: 'two', meaning: '둘', category: '숫자', pronunciation: 'tuː' },
  { word: 'three', meaning: '셋', category: '숫자', pronunciation: 'θriː' },
  { word: 'four', meaning: '넷', category: '숫자', pronunciation: 'fɔːr' },
  { word: 'five', meaning: '다섯', category: '숫자', pronunciation: 'faɪv' },
  
  // 가족
  { word: 'mom', meaning: '엄마', category: '가족', pronunciation: 'mɑːm' },
  { word: 'dad', meaning: '아빠', category: '가족', pronunciation: 'dæd' },
  { word: 'brother', meaning: '형/오빠/남동생', category: '가족', pronunciation: 'brʌðər' },
  { word: 'sister', meaning: '언니/누나/여동생', category: '가족', pronunciation: 'sɪstər' },
  { word: 'baby', meaning: '아기', category: '가족', pronunciation: 'beɪbi' },
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
}

addWords();
