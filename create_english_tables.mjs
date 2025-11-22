import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('📚 영어 학습 테이블 생성 시작\n');

  // 1. english_words 테이블 생성
  const createWordsTable = `
    CREATE TABLE IF NOT EXISTS english_words (
      id SERIAL PRIMARY KEY,
      word VARCHAR(100) NOT NULL,
      meaning VARCHAR(200) NOT NULL,
      category VARCHAR(50) NOT NULL,
      image_url TEXT,
      pronunciation VARCHAR(200),
      difficulty_level INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  // 2. english_learning_progress 테이블 생성
  const createProgressTable = `
    CREATE TABLE IF NOT EXISTS english_learning_progress (
      id SERIAL PRIMARY KEY,
      juwoo_id INT NOT NULL,
      word_id INT NOT NULL,
      mastery_level INT DEFAULT 0,
      last_reviewed_at TIMESTAMP,
      review_count INT DEFAULT 0,
      correct_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (word_id) REFERENCES english_words(id)
    );
  `;

  // 3. english_quiz_results 테이블 생성
  const createQuizTable = `
    CREATE TABLE IF NOT EXISTS english_quiz_results (
      id SERIAL PRIMARY KEY,
      juwoo_id INT NOT NULL,
      quiz_type VARCHAR(50) NOT NULL,
      total_questions INT NOT NULL,
      correct_answers INT NOT NULL,
      score INT NOT NULL,
      stars INT NOT NULL,
      completed_at TIMESTAMP DEFAULT NOW()
    );
  `;

  console.log('테이블 생성 완료!\n');
}

createTables();
