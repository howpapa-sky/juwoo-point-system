// 빈칸 채우기용 문장 데이터
// englishWordsData.ts의 example/exampleKorean 필드를 우선 사용하고,
// 추가 문장이 필요할 때 이 데이터를 참조
// 초등 2학년 수준 문장 구조

export interface SentenceTemplate {
  sentence: string;
  sentenceKorean: string;
  blankWord: string;
  category: string;
}

export const sentenceTemplates: SentenceTemplate[] = [
  // 동물
  { sentence: "I have a pet _____.", sentenceKorean: "나는 반려 _____가 있어요.", blankWord: "dog", category: "동물" },
  { sentence: "The _____ is sleeping.", sentenceKorean: "_____ 가 자고 있어요.", blankWord: "cat", category: "동물" },
  { sentence: "A _____ can fly.", sentenceKorean: "_____ 는 날 수 있어요.", blankWord: "bird", category: "동물" },
  { sentence: "The _____ swims in water.", sentenceKorean: "_____ 가 물에서 헤엄쳐요.", blankWord: "fish", category: "동물" },
  { sentence: "I like the _____.", sentenceKorean: "나는 _____ 를 좋아해요.", blankWord: "rabbit", category: "동물" },
  { sentence: "The _____ is very big.", sentenceKorean: "_____ 는 매우 커요.", blankWord: "elephant", category: "동물" },
  { sentence: "A _____ says \"ribbit\".", sentenceKorean: "_____ 가 '개굴' 해요.", blankWord: "frog", category: "동물" },
  { sentence: "The _____ runs fast.", sentenceKorean: "_____ 가 빨리 달려요.", blankWord: "horse", category: "동물" },

  // 과일
  { sentence: "I eat an _____ every day.", sentenceKorean: "나는 매일 _____ 를 먹어요.", blankWord: "apple", category: "과일" },
  { sentence: "The _____ is yellow.", sentenceKorean: "_____ 는 노란색이에요.", blankWord: "banana", category: "과일" },
  { sentence: "I like _____ juice.", sentenceKorean: "나는 _____ 주스를 좋아해요.", blankWord: "orange", category: "과일" },
  { sentence: "_____ is very sweet.", sentenceKorean: "_____ 는 매우 달아요.", blankWord: "grape", category: "과일" },
  { sentence: "The _____ is red.", sentenceKorean: "_____ 는 빨간색이에요.", blankWord: "strawberry", category: "과일" },
  { sentence: "_____ has many seeds.", sentenceKorean: "_____ 에는 씨가 많아요.", blankWord: "watermelon", category: "과일" },

  // 음식
  { sentence: "I want some _____.", sentenceKorean: "나는 _____ 를 원해요.", blankWord: "bread", category: "음식" },
  { sentence: "_____ is white.", sentenceKorean: "_____ 은 하얀색이에요.", blankWord: "milk", category: "음식" },
  { sentence: "I like _____.", sentenceKorean: "나는 _____ 를 좋아해요.", blankWord: "pizza", category: "음식" },
  { sentence: "The _____ is yummy.", sentenceKorean: "_____ 는 맛있어요.", blankWord: "cake", category: "음식" },
  { sentence: "I eat _____ for breakfast.", sentenceKorean: "나는 아침에 _____ 를 먹어요.", blankWord: "egg", category: "음식" },
  { sentence: "Can I have some _____?", sentenceKorean: "_____ 좀 줄 수 있어요?", blankWord: "water", category: "음식" },

  // 색깔
  { sentence: "The sky is _____.", sentenceKorean: "하늘은 _____ 이에요.", blankWord: "blue", category: "색깔" },
  { sentence: "The grass is _____.", sentenceKorean: "잔디는 _____ 이에요.", blankWord: "green", category: "색깔" },
  { sentence: "The sun is _____.", sentenceKorean: "태양은 _____ 이에요.", blankWord: "yellow", category: "색깔" },
  { sentence: "Snow is _____.", sentenceKorean: "눈은 _____ 이에요.", blankWord: "white", category: "색깔" },

  // 가족
  { sentence: "My _____ loves me.", sentenceKorean: "우리 _____ 가 나를 사랑해요.", blankWord: "mom", category: "가족" },
  { sentence: "I play with my _____.", sentenceKorean: "나는 _____ 와 놀아요.", blankWord: "brother", category: "가족" },
  { sentence: "My _____ reads books.", sentenceKorean: "우리 _____ 는 책을 읽어요.", blankWord: "dad", category: "가족" },
  { sentence: "My _____ is kind.", sentenceKorean: "우리 _____ 는 친절해요.", blankWord: "grandma", category: "가족" },

  // 숫자
  { sentence: "I have _____ fingers.", sentenceKorean: "나는 손가락이 _____ 개 있어요.", blankWord: "ten", category: "숫자" },
  { sentence: "There are _____ seasons.", sentenceKorean: "계절은 _____ 개 있어요.", blankWord: "four", category: "숫자" },
  { sentence: "I am _____ years old.", sentenceKorean: "나는 _____ 살이에요.", blankWord: "eight", category: "숫자" },

  // 자연
  { sentence: "The _____ is shining.", sentenceKorean: "_____ 이 빛나고 있어요.", blankWord: "sun", category: "자연" },
  { sentence: "I see the _____.", sentenceKorean: "나는 _____ 을 봐요.", blankWord: "moon", category: "자연" },
  { sentence: "_____ is falling.", sentenceKorean: "_____ 이 내리고 있어요.", blankWord: "rain", category: "자연" },

  // 감정
  { sentence: "I am _____.", sentenceKorean: "나는 _____ 해요.", blankWord: "happy", category: "감정" },
  { sentence: "She is _____.", sentenceKorean: "그녀는 _____ 해요.", blankWord: "sad", category: "감정" },

  // 동사
  { sentence: "I _____ to school.", sentenceKorean: "나는 학교에 _____ 요.", blankWord: "go", category: "동사" },
  { sentence: "I _____ books.", sentenceKorean: "나는 책을 _____ 요.", blankWord: "read", category: "동사" },
  { sentence: "I _____ my homework.", sentenceKorean: "나는 숙제를 _____ 요.", blankWord: "do", category: "동사" },
];
