// 스토리 기반 학습 데이터
// Unit 1~12 각 1편씩 12개 스토리

export type InteractionType = 'read' | 'tap-word' | 'fill-blank' | 'speak' | 'choose';

export interface StoryInteraction {
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  hint?: string;
}

export interface StoryPage {
  pageNumber: number;
  textKo: string;
  textEn: string;
  highlightWords: string[];
  interactionType: InteractionType;
  interaction?: StoryInteraction;
}

export interface LearningStory {
  id: string;
  unitId: string;
  title: string;
  titleEn: string;
  description: string;
  pages: StoryPage[];
  targetWords: string[];
}

export const STORIES: LearningStory[] = [
  // ========== Unit 1: 인사와 소개 ==========
  {
    id: 'story-hello-juwoo',
    unitId: 'unit-01',
    title: '주우의 첫 번째 인사',
    titleEn: "Juwoo's First Hello",
    description: '새 친구를 만나 인사하는 이야기',
    targetWords: ['hello', 'hi', 'my', 'name', 'is', 'friend', 'good', 'morning', 'bye'],
    pages: [
      {
        pageNumber: 1,
        textKo: '어느 날 아침, 주우는 공원에서 새 친구를 만났어요.',
        textEn: 'One morning, Juwoo met a new friend at the park.',
        highlightWords: ['morning', 'friend'],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '"안녕!" 주우가 말했어요.',
        textEn: '"Hello!" said Juwoo.',
        highlightWords: ['hello'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '새 친구도 대답했어요. "안녕! 나는 미아야!"',
        textEn: 'The new friend said, "Hi! My name is Mia!"',
        highlightWords: ['hi', 'my', 'name', 'is'],
        interactionType: 'speak',
        interaction: {
          prompt: '"Hello"라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '주우가 자기 이름을 말했어요.',
        textEn: '"My _____ is Juwoo."',
        highlightWords: ['my', 'name'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '빈칸에 들어갈 단어를 골라보자!',
          options: ['name', 'game', 'same'],
          correctAnswer: 'name',
          hint: '"이름"을 영어로 뭐라고 할까?',
        },
      },
      {
        pageNumber: 5,
        textKo: '주우와 미아는 함께 놀았어요. 정말 좋은 아침이었어요!',
        textEn: 'Juwoo and Mia played together. It was a good morning!',
        highlightWords: ['good', 'morning'],
        interactionType: 'choose',
        interaction: {
          prompt: '"good morning"은 무슨 뜻일까?',
          options: ['좋은 아침', '좋은 저녁', '안녕히 가세요'],
          correctAnswer: '좋은 아침',
        },
      },
      {
        pageNumber: 6,
        textKo: '집에 갈 시간이에요. "잘 가, 미아!" 주우가 말했어요.',
        textEn: '"Bye, Mia!" said Juwoo. "Bye bye, Juwoo!"',
        highlightWords: ['bye'],
        interactionType: 'tap-word',
      },
    ],
  },

  // ========== Unit 2: 나의 가족 ==========
  {
    id: 'story-my-family',
    unitId: 'unit-02',
    title: '주우네 가족 소개',
    titleEn: "Juwoo's Family",
    description: '주우가 자기 가족을 소개하는 이야기',
    targetWords: ['mom', 'dad', 'family', 'love', 'happy', 'big', 'small', 'baby'],
    pages: [
      {
        pageNumber: 1,
        textKo: '주우는 자기 가족을 아주 좋아해요.',
        textEn: 'Juwoo loves his family very much.',
        highlightWords: ['love', 'family'],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '"이건 우리 엄마야. 엄마는 요리를 잘 해요!"',
        textEn: '"This is my mom. Mom cooks yummy food!"',
        highlightWords: ['mom'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '"이건 우리 아빠야. 아빠는 아주 커요!"',
        textEn: '"This is my dad. My dad is very big!"',
        highlightWords: ['dad', 'big'],
        interactionType: 'speak',
        interaction: {
          prompt: '"My dad"이라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '주우에게는 작은 동생이 있어요.',
        textEn: 'Juwoo has a _____ baby sister.',
        highlightWords: ['small', 'baby'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '아기 동생은 크기가 어때?',
          options: ['small', 'big', 'fast'],
          correctAnswer: 'small',
          hint: '"작은"을 영어로 뭐라고 할까?',
        },
      },
      {
        pageNumber: 5,
        textKo: '주우는 가족과 함께 있으면 정말 행복해요!',
        textEn: 'Juwoo is very happy with his family!',
        highlightWords: ['happy', 'family'],
        interactionType: 'choose',
        interaction: {
          prompt: '"happy"는 무슨 뜻일까?',
          options: ['행복한', '슬픈', '배고픈'],
          correctAnswer: '행복한',
        },
      },
    ],
  },

  // ========== Unit 3: 색깔의 세계 ==========
  {
    id: 'story-rainbow-adventure',
    unitId: 'unit-03',
    title: '무지개를 찾아서',
    titleEn: 'Finding the Rainbow',
    description: '주우가 무지개를 찾으러 떠나는 이야기',
    targetWords: ['red', 'blue', 'yellow', 'green', 'color', 'rainbow', 'like', 'see'],
    pages: [
      {
        pageNumber: 1,
        textKo: '비가 그쳤어요. 주우가 하늘을 올려다봤어요.',
        textEn: 'The rain stopped. Juwoo looked up at the sky.',
        highlightWords: [],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '"와! 무지개다!" 주우가 소리쳤어요.',
        textEn: '"Wow! I see a rainbow!" Juwoo shouted.',
        highlightWords: ['see', 'rainbow'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '무지개에는 빨간색이 있어요.',
        textEn: 'The rainbow has red. I like red!',
        highlightWords: ['red', 'like'],
        interactionType: 'speak',
        interaction: {
          prompt: '"Red"라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '파란색도 있고, 노란색도 있어요!',
        textEn: 'I see _____ and yellow too!',
        highlightWords: ['blue', 'yellow'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '빈칸에 들어갈 색깔은?',
          options: ['blue', 'big', 'bye'],
          correctAnswer: 'blue',
          hint: '하늘의 색깔이야!',
        },
      },
      {
        pageNumber: 5,
        textKo: '"무지개에는 정말 많은 색이 있구나!"',
        textEn: '"The rainbow has many colors!"',
        highlightWords: ['color'],
        interactionType: 'choose',
        interaction: {
          prompt: '"colors"는 무슨 뜻일까?',
          options: ['색깔들', '구름들', '꽃들'],
          correctAnswer: '색깔들',
        },
      },
      {
        pageNumber: 6,
        textKo: '주우는 초록색이 제일 좋아요. 나는 초록색이 좋아!',
        textEn: 'Juwoo likes green the most. "I like green!"',
        highlightWords: ['green', 'like'],
        interactionType: 'tap-word',
      },
    ],
  },

  // ========== Unit 4: 숫자를 세어보자 ==========
  {
    id: 'story-counting-stars',
    unitId: 'unit-04',
    title: '별을 세어보자',
    titleEn: 'Counting Stars',
    description: '밤하늘의 별을 세면서 숫자를 배우는 이야기',
    targetWords: ['one', 'two', 'three', 'four', 'five', 'count', 'how', 'many', 'ten'],
    pages: [
      {
        pageNumber: 1,
        textKo: '밤이 되었어요. 주우가 창밖을 봤어요.',
        textEn: 'It was night. Juwoo looked out the window.',
        highlightWords: [],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '"와, 별이 많다! 몇 개나 있을까?"',
        textEn: '"Wow, so many stars! How many are there?"',
        highlightWords: ['how', 'many'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '"하나, 둘, 셋!" 주우가 세기 시작했어요.',
        textEn: '"One, two, three!" Juwoo started to count.',
        highlightWords: ['one', 'two', 'three', 'count'],
        interactionType: 'speak',
        interaction: {
          prompt: '"One, two, three"라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '주우는 계속 세었어요. "넷, 다섯..."',
        textEn: 'Juwoo kept counting. "_____, five..."',
        highlightWords: ['four', 'five'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '"넷"은 영어로?',
          options: ['four', 'for', 'fun'],
          correctAnswer: 'four',
          hint: '3 다음 숫자야!',
        },
      },
      {
        pageNumber: 5,
        textKo: '"열까지 셀 수 있어!" 주우가 뿌듯해했어요.',
        textEn: '"I can count to ten!" Juwoo was proud.',
        highlightWords: ['count', 'ten'],
        interactionType: 'choose',
        interaction: {
          prompt: '"ten"은 몇일까?',
          options: ['10', '5', '100'],
          correctAnswer: '10',
        },
      },
    ],
  },

  // ========== Unit 5: 동물 친구들 ==========
  {
    id: 'story-zoo-day',
    unitId: 'unit-05',
    title: '동물원에 간 날',
    titleEn: 'A Day at the Zoo',
    description: '주우가 동물원에서 동물 친구들을 만나는 이야기',
    targetWords: ['cat', 'dog', 'bird', 'rabbit', 'lion', 'elephant', 'monkey', 'cute', 'fast', 'big'],
    pages: [
      {
        pageNumber: 1,
        textKo: '오늘은 동물원에 가는 날이에요! 주우가 신이 났어요.',
        textEn: 'Today is zoo day! Juwoo was excited.',
        highlightWords: [],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '제일 먼저 토끼를 봤어요. "토끼가 정말 귀엽다!"',
        textEn: 'First, they saw a rabbit. "The rabbit is so cute!"',
        highlightWords: ['rabbit', 'cute'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '그 다음엔 코끼리를 봤어요. 코끼리는 정말 크구나!',
        textEn: 'Next, they saw an elephant. The elephant is very big!',
        highlightWords: ['elephant', 'big'],
        interactionType: 'speak',
        interaction: {
          prompt: '"Elephant"이라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '원숭이가 나무 위에서 바나나를 먹고 있어요.',
        textEn: 'The _____ is eating a banana in the tree.',
        highlightWords: ['monkey'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '나무 위에서 바나나를 먹는 동물은?',
          options: ['monkey', 'rabbit', 'fish'],
          correctAnswer: 'monkey',
          hint: '바나나를 좋아하는 동물!',
        },
      },
      {
        pageNumber: 5,
        textKo: '사자가 으르렁! 멋있다!',
        textEn: 'The lion goes ROAR! So cool!',
        highlightWords: ['lion'],
        interactionType: 'choose',
        interaction: {
          prompt: '"lion"은 무슨 동물일까?',
          options: ['사자', '호랑이', '곰'],
          correctAnswer: '사자',
        },
      },
      {
        pageNumber: 6,
        textKo: '즐거운 동물원 나들이였어요! 다음에 또 오자!',
        textEn: 'It was a fun day at the zoo! "Let\'s come again!"',
        highlightWords: [],
        interactionType: 'read',
      },
    ],
  },

  // ========== Unit 6: 맛있는 음식 ==========
  {
    id: 'story-picnic-day',
    unitId: 'unit-06',
    title: '소풍 가는 날',
    titleEn: 'Picnic Day',
    description: '주우가 소풍에서 맛있는 음식을 먹는 이야기',
    targetWords: ['apple', 'banana', 'milk', 'bread', 'water', 'cake', 'eat', 'drink', 'yummy', 'hungry'],
    pages: [
      {
        pageNumber: 1,
        textKo: '오늘은 소풍 가는 날이에요! 주우가 배가 고파요.',
        textEn: 'Today is picnic day! Juwoo is hungry.',
        highlightWords: ['hungry'],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '엄마가 샌드위치를 만들어줬어요. 빵이 정말 맛있어요!',
        textEn: 'Mom made sandwiches. The bread is yummy!',
        highlightWords: ['bread', 'yummy'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '주우가 사과를 먹어요. "사과 맛있다!"',
        textEn: 'Juwoo eats an apple. "Yummy!"',
        highlightWords: ['eat', 'apple'],
        interactionType: 'speak',
        interaction: {
          prompt: '"Apple"이라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '목이 마르다! 뭘 마실까?',
        textEn: 'I am thirsty! I want to drink _____.',
        highlightWords: ['drink', 'water'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '목이 마를 때 뭘 마실까?',
          options: ['water', 'cake', 'bread'],
          correctAnswer: 'water',
          hint: '투명하고 시원한 것!',
        },
      },
      {
        pageNumber: 5,
        textKo: '케이크도 있어요! 맛있겠다!',
        textEn: 'There is cake too! Yummy!',
        highlightWords: ['cake', 'yummy'],
        interactionType: 'choose',
        interaction: {
          prompt: '"yummy"는 무슨 뜻일까?',
          options: ['맛있는', '예쁜', '큰'],
          correctAnswer: '맛있는',
        },
      },
      {
        pageNumber: 6,
        textKo: '소풍이 정말 즐거웠어요! 배가 불러요!',
        textEn: 'The picnic was fun! Juwoo is full and happy!',
        highlightWords: ['happy'],
        interactionType: 'read',
      },
    ],
  },

  // ========== Unit 7: 내 몸 ==========
  {
    id: 'story-body-song',
    unitId: 'unit-07',
    title: '몸으로 노래해요',
    titleEn: 'Body Song',
    description: '주우가 몸을 움직이며 노래하는 이야기',
    targetWords: ['head', 'eye', 'nose', 'mouth', 'ear', 'hand', 'foot', 'face', 'finger'],
    pages: [
      {
        pageNumber: 1,
        textKo: '오늘 음악 시간이에요! 선생님이 신나는 노래를 틀어줬어요.',
        textEn: 'Today is music time! The teacher plays a fun song.',
        highlightWords: [],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '"머리를 만져봐!" 선생님이 말했어요.',
        textEn: '"Touch your head!" said the teacher.',
        highlightWords: ['head'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '주우가 따라 해요. "눈! 코! 입!"',
        textEn: 'Juwoo follows along. "Eye! Nose! Mouth!"',
        highlightWords: ['eye', 'nose', 'mouth'],
        interactionType: 'speak',
        interaction: {
          prompt: '"Eye, nose, mouth"라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '이번에는 손을 흔들어요!',
        textEn: 'Now wave your _____!',
        highlightWords: ['hand'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '흔들 수 있는 것은?',
          options: ['hand', 'head', 'hair'],
          correctAnswer: 'hand',
          hint: '다섯 개의 손가락이 있는 곳!',
        },
      },
      {
        pageNumber: 5,
        textKo: '주우가 손가락 열 개를 세어봤어요!',
        textEn: 'Juwoo counted all ten fingers!',
        highlightWords: ['finger'],
        interactionType: 'choose',
        interaction: {
          prompt: '"finger"는 무슨 뜻일까?',
          options: ['손가락', '발가락', '팔'],
          correctAnswer: '손가락',
        },
      },
      {
        pageNumber: 6,
        textKo: '정말 재미있는 노래였어요! 주우는 얼굴이 빨개질 때까지 웃었어요.',
        textEn: 'What a fun song! Juwoo laughed until his face turned red.',
        highlightWords: ['face'],
        interactionType: 'tap-word',
      },
    ],
  },

  // ========== Unit 8: 옷을 입자 ==========
  {
    id: 'story-getting-dressed',
    unitId: 'unit-08',
    title: '오늘 뭐 입지?',
    titleEn: 'Getting Dressed',
    description: '주우가 아침에 옷을 고르는 이야기',
    targetWords: ['shirt', 'pants', 'shoes', 'hat', 'socks', 'jacket', 'wear', 'put on'],
    pages: [
      {
        pageNumber: 1,
        textKo: '아침이에요! 주우가 옷을 입어야 해요.',
        textEn: 'It is morning! Juwoo needs to get dressed.',
        highlightWords: [],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '주우가 셔츠를 입었어요. 파란색 셔츠가 멋져요!',
        textEn: 'Juwoo put on a shirt. The blue shirt looks cool!',
        highlightWords: ['shirt', 'put on'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '바지도 입었어요. 이제 양말이랑 신발도 신어야 해요.',
        textEn: 'Juwoo put on pants. Now socks and shoes too!',
        highlightWords: ['pants', 'socks', 'shoes'],
        interactionType: 'speak',
        interaction: {
          prompt: '"Shoes"라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '밖이 추워요! 뭘 더 입을까?',
        textEn: 'It is cold outside! Juwoo should wear a _____.',
        highlightWords: ['wear', 'jacket'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '추울 때 입는 것은?',
          options: ['jacket', 'hat', 'socks'],
          correctAnswer: 'jacket',
          hint: '겉옷이야!',
        },
      },
      {
        pageNumber: 5,
        textKo: '모자도 쓰면 완벽해! 준비 완료!',
        textEn: 'A hat too! Now Juwoo is ready!',
        highlightWords: ['hat'],
        interactionType: 'choose',
        interaction: {
          prompt: '"hat"은 무슨 뜻일까?',
          options: ['모자', '장갑', '목도리'],
          correctAnswer: '모자',
        },
      },
    ],
  },

  // ========== Unit 9: 우리 집 ==========
  {
    id: 'story-my-house',
    unitId: 'unit-09',
    title: '우리 집 구경하기',
    titleEn: 'Tour of My House',
    description: '주우가 친구에게 집을 보여주는 이야기',
    targetWords: ['house', 'room', 'door', 'window', 'bed', 'table', 'kitchen', 'sleep', 'open'],
    pages: [
      {
        pageNumber: 1,
        textKo: '주우의 친구 미아가 집에 놀러 왔어요!',
        textEn: 'Juwoo\'s friend Mia came to his house!',
        highlightWords: ['house'],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '"여기가 내 방이야! 문을 열어볼래?"',
        textEn: '"This is my room! Open the door!"',
        highlightWords: ['room', 'open', 'door'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '방에는 침대가 있어요. 주우가 여기서 자요.',
        textEn: 'There is a bed in the room. Juwoo sleeps here.',
        highlightWords: ['bed', 'sleep'],
        interactionType: 'speak',
        interaction: {
          prompt: '"My room"이라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '부엌에 가볼까? 맛있는 냄새가 나요!',
        textEn: 'Let\'s go to the _____! Something smells yummy!',
        highlightWords: ['kitchen'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '음식을 만드는 곳은?',
          options: ['kitchen', 'window', 'table'],
          correctAnswer: 'kitchen',
          hint: '엄마가 요리하는 곳!',
        },
      },
      {
        pageNumber: 5,
        textKo: '창문 밖을 보면 공원이 보여요!',
        textEn: 'Look through the window! You can see the park!',
        highlightWords: ['window'],
        interactionType: 'choose',
        interaction: {
          prompt: '"window"는 무슨 뜻일까?',
          options: ['창문', '문', '벽'],
          correctAnswer: '창문',
        },
      },
      {
        pageNumber: 6,
        textKo: '미아가 말했어요. "주우네 집 정말 좋다!"',
        textEn: '"I like your house, Juwoo!" said Mia.',
        highlightWords: ['house'],
        interactionType: 'read',
      },
    ],
  },

  // ========== Unit 10: 학교에서 ==========
  {
    id: 'story-school-day',
    unitId: 'unit-10',
    title: '즐거운 학교생활',
    titleEn: 'A Fun School Day',
    description: '주우의 즐거운 학교 하루 이야기',
    targetWords: ['school', 'teacher', 'book', 'pencil', 'desk', 'read', 'write', 'draw', 'learn'],
    pages: [
      {
        pageNumber: 1,
        textKo: '주우가 학교에 도착했어요! 오늘은 무얼 배울까?',
        textEn: 'Juwoo arrived at school! What will he learn today?',
        highlightWords: ['school', 'learn'],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '선생님이 책을 들고 오셨어요. "오늘은 재미있는 이야기를 읽을 거예요!"',
        textEn: 'The teacher brought a book. "We will read a fun story!"',
        highlightWords: ['teacher', 'book', 'read'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '주우가 연필을 들고 글을 써요.',
        textEn: 'Juwoo picks up a pencil and starts to write.',
        highlightWords: ['pencil', 'write'],
        interactionType: 'speak',
        interaction: {
          prompt: '"Pencil"이라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '미술 시간이에요! 주우가 제일 좋아하는 시간!',
        textEn: 'Art time! Juwoo loves to _____!',
        highlightWords: ['draw'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '미술 시간에 하는 것은?',
          options: ['draw', 'drink', 'dance'],
          correctAnswer: 'draw',
          hint: '연필이나 크레용으로 해요!',
        },
      },
      {
        pageNumber: 5,
        textKo: '주우의 그림이 책상 위에 있어요. 정말 멋진 그림이에요!',
        textEn: 'Juwoo\'s drawing is on the desk. It is wonderful!',
        highlightWords: ['desk'],
        interactionType: 'choose',
        interaction: {
          prompt: '"desk"는 무슨 뜻일까?',
          options: ['책상', '의자', '교실'],
          correctAnswer: '책상',
        },
      },
    ],
  },

  // ========== Unit 11: 날씨와 계절 ==========
  {
    id: 'story-four-seasons',
    unitId: 'unit-11',
    title: '사계절 이야기',
    titleEn: 'The Four Seasons',
    description: '주우가 사계절을 경험하는 이야기',
    targetWords: ['sun', 'rain', 'snow', 'wind', 'hot', 'cold', 'warm', 'spring', 'summer', 'winter'],
    pages: [
      {
        pageNumber: 1,
        textKo: '봄이에요! 따뜻한 바람이 불어요. 꽃이 피기 시작해요.',
        textEn: 'It is spring! The warm wind blows. Flowers start to bloom.',
        highlightWords: ['spring', 'warm', 'wind'],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '여름이 왔어요! 해가 뜨겁게 비쳐요!',
        textEn: 'Summer is here! The sun is very hot!',
        highlightWords: ['summer', 'sun', 'hot'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '가을에는 비가 와요. 우산이 필요해요!',
        textEn: 'In fall, it rains. We need an umbrella!',
        highlightWords: ['rain'],
        interactionType: 'speak',
        interaction: {
          prompt: '"Rain"이라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '겨울이에요! 밖이 아주 추워요! 뭐가 내릴까?',
        textEn: 'Winter is here! It is very cold! Look, it is _____!',
        highlightWords: ['winter', 'cold', 'snow'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '겨울에 하늘에서 내리는 하얀 것은?',
          options: ['snow', 'sun', 'rain'],
          correctAnswer: 'snow',
          hint: '하얗고 차가워요!',
        },
      },
      {
        pageNumber: 5,
        textKo: '주우가 제일 좋아하는 계절은 여름이에요. 수영할 수 있거든요!',
        textEn: 'Juwoo\'s favorite season is summer! He can swim!',
        highlightWords: ['summer'],
        interactionType: 'choose',
        interaction: {
          prompt: '"summer"는 어떤 계절일까?',
          options: ['여름', '겨울', '봄'],
          correctAnswer: '여름',
        },
      },
    ],
  },

  // ========== Unit 12: 놀이 시간 ==========
  {
    id: 'story-play-time',
    unitId: 'unit-12',
    title: '공원에서 놀자!',
    titleEn: 'Fun at the Park',
    description: '주우가 공원에서 친구들과 노는 이야기',
    targetWords: ['ball', 'toy', 'game', 'run', 'jump', 'sing', 'dance', 'fun', 'park', 'together'],
    pages: [
      {
        pageNumber: 1,
        textKo: '오늘은 공원에 가는 날이에요! 친구들과 같이 놀 거예요!',
        textEn: 'Today we go to the park! We will play together!',
        highlightWords: ['park', 'together'],
        interactionType: 'read',
      },
      {
        pageNumber: 2,
        textKo: '주우가 공을 가져왔어요. "같이 공놀이 하자!"',
        textEn: 'Juwoo brought a ball. "Let\'s play ball!"',
        highlightWords: ['ball'],
        interactionType: 'tap-word',
      },
      {
        pageNumber: 3,
        textKo: '친구들이 달리기도 하고, 점프도 해요!',
        textEn: 'Friends run and jump! So much fun!',
        highlightWords: ['run', 'jump', 'fun'],
        interactionType: 'speak',
        interaction: {
          prompt: '"Run"이라고 말해보자!',
        },
      },
      {
        pageNumber: 4,
        textKo: '미아가 말했어요. "노래 부르자!"',
        textEn: 'Mia said, "Let\'s _____!"',
        highlightWords: ['sing'],
        interactionType: 'fill-blank',
        interaction: {
          prompt: '음악에 맞춰 하는 것은?',
          options: ['sing', 'swim', 'sleep'],
          correctAnswer: 'sing',
          hint: '목소리로 음악을 만드는 거야!',
        },
      },
      {
        pageNumber: 5,
        textKo: '모두 함께 춤도 추었어요. 정말 신나는 하루!',
        textEn: 'Everyone danced together. What a fun day!',
        highlightWords: ['dance', 'together'],
        interactionType: 'choose',
        interaction: {
          prompt: '"dance"는 무슨 뜻일까?',
          options: ['춤추다', '노래하다', '달리다'],
          correctAnswer: '춤추다',
        },
      },
      {
        pageNumber: 6,
        textKo: '해가 지고 있어요. "다음에 또 같이 놀자!" 주우가 말했어요.',
        textEn: '"Let\'s play together again!" said Juwoo.',
        highlightWords: ['together'],
        interactionType: 'read',
      },
    ],
  },
];

// 스토리 ID로 찾기
export function getStoryById(storyId: string): LearningStory | undefined {
  return STORIES.find((s) => s.id === storyId);
}

// 유닛 ID로 스토리 찾기
export function getStoryByUnitId(unitId: string): LearningStory | undefined {
  return STORIES.find((s) => s.unitId === unitId);
}
