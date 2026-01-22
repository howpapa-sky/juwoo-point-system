// 퀴즈 데이터 통합 export
export * from './types';
export { pokemonGoGuideQuiz } from './pokemonGoGuideQuiz';
export { typeMatchupQuiz } from './typeMatchupQuiz';
export { dragonVillageQuiz } from './dragonVillageQuiz';
export { dragonVillageStory1Quiz } from './dragonVillageStory1Quiz';
export { dragonVillageStory2Quiz } from './dragonVillageStory2Quiz';
export { dragonVillageStory3Quiz } from './dragonVillageStory3Quiz';

import { QuizQuestion, QuizTier } from './types';
import { pokemonGoGuideQuiz } from './pokemonGoGuideQuiz';
import { typeMatchupQuiz } from './typeMatchupQuiz';
import { dragonVillageQuiz } from './dragonVillageQuiz';
import { dragonVillageStory1Quiz } from './dragonVillageStory1Quiz';
import { dragonVillageStory2Quiz } from './dragonVillageStory2Quiz';
import { dragonVillageStory3Quiz } from './dragonVillageStory3Quiz';

// 모든 퀴즈 데이터
const allQuizData: QuizQuestion[] = [
  ...pokemonGoGuideQuiz,
  ...typeMatchupQuiz,
  ...dragonVillageQuiz,
  ...dragonVillageStory1Quiz,
  ...dragonVillageStory2Quiz,
  ...dragonVillageStory3Quiz,
];

// 책 ID로 퀴즈 가져오기
export const getQuizzesByBookId = (bookId: string): QuizQuestion[] => {
  return allQuizData.filter(q => q.bookId === bookId);
};

// 책 ID와 티어로 퀴즈 가져오기
export const getQuizzesByBookAndTier = (bookId: string, tier: QuizTier): QuizQuestion[] => {
  return allQuizData.filter(q => q.bookId === bookId && q.quizTier === tier);
};

// 책에 퀴즈가 있는지 확인
export const hasQuizForBook = (bookId: string): boolean => {
  return allQuizData.some(q => q.bookId === bookId);
};

// 책의 퀴즈 티어별 개수 가져오기
export const getQuizCountsByTier = (bookId: string): Record<QuizTier, number> => {
  const quizzes = getQuizzesByBookId(bookId);
  return {
    basic: quizzes.filter(q => q.quizTier === 'basic').length,
    intermediate: quizzes.filter(q => q.quizTier === 'intermediate').length,
    master: quizzes.filter(q => q.quizTier === 'master').length,
  };
};

// 모든 퀴즈 가져오기
export const getAllQuizzes = (): QuizQuestion[] => {
  return allQuizData;
};

// 책별 퀴즈 가져오기 (alias)
export const getQuizzesByBook = getQuizzesByBookId;

export default allQuizData;
