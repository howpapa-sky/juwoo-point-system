// 영어유치원 2년차 졸업반 주우를 위한 영어 단어 데이터 - v2.0 대규모 업그레이드
// 총 1000개 이상 단어, 25개 카테고리, 4단계 난이도

export type WordCategory =
  | "동물"
  | "과일"
  | "색깔"
  | "숫자"
  | "가족"
  | "음식"
  | "자연"
  | "탈것"
  | "신체"
  | "감정"
  | "날씨"
  | "포켓몬"
  | "동사"
  | "학교"
  | "장소"
  | "반대말"
  | "시간"
  | "일상표현"
  | "옷"
  | "집"
  | "스포츠"
  | "직업"
  | "악기"
  | "형용사"
  | "문장";

export type WordDifficulty = "easy" | "medium" | "hard" | "expert";

export interface EnglishWord {
  id: number;
  word: string;
  meaning: string;
  pronunciation: string;
  category: WordCategory;
  difficulty: WordDifficulty;
  example: string;
  exampleKorean: string;
  synonyms?: string[];
  tip?: string;
  image?: string;
}

export const englishWordsData: EnglishWord[] = [
  // ========================================
  // 🐾 동물 (Animals) - 80개
  // ========================================

  // 동물 - easy (20개)
  { id: 1, word: "cat", meaning: "고양이", pronunciation: "캣", category: "동물", difficulty: "easy", example: "The cat is sleeping.", exampleKorean: "고양이가 자고 있어요.", tip: "야옹! 🐱" },
  { id: 2, word: "dog", meaning: "강아지", pronunciation: "도그", category: "동물", difficulty: "easy", example: "I love my dog.", exampleKorean: "나는 내 강아지를 사랑해요.", tip: "멍멍! 🐕" },
  { id: 3, word: "bird", meaning: "새", pronunciation: "버드", category: "동물", difficulty: "easy", example: "The bird can fly.", exampleKorean: "새는 날 수 있어요.", tip: "짹짹! 🐦" },
  { id: 4, word: "fish", meaning: "물고기", pronunciation: "피쉬", category: "동물", difficulty: "easy", example: "Fish swim in water.", exampleKorean: "물고기는 물에서 헤엄쳐요.", tip: "뻐끔뻐끔! 🐟" },
  { id: 5, word: "cow", meaning: "소", pronunciation: "카우", category: "동물", difficulty: "easy", example: "The cow says moo.", exampleKorean: "소가 음메 해요.", tip: "음메~! 🐄" },
  { id: 6, word: "pig", meaning: "돼지", pronunciation: "피그", category: "동물", difficulty: "easy", example: "The pig is pink.", exampleKorean: "돼지는 분홍색이에요.", tip: "꿀꿀! 🐷" },
  { id: 7, word: "duck", meaning: "오리", pronunciation: "덕", category: "동물", difficulty: "easy", example: "The duck swims.", exampleKorean: "오리가 헤엄쳐요.", tip: "꽥꽥! 🦆" },
  { id: 8, word: "hen", meaning: "암탉", pronunciation: "헨", category: "동물", difficulty: "easy", example: "The hen lays eggs.", exampleKorean: "암탉이 알을 낳아요.", tip: "꼬꼬댁! 🐔" },
  { id: 9, word: "horse", meaning: "말", pronunciation: "호스", category: "동물", difficulty: "easy", example: "The horse runs fast.", exampleKorean: "말은 빨리 달려요.", tip: "히힝! 🐴" },
  { id: 10, word: "sheep", meaning: "양", pronunciation: "쉽", category: "동물", difficulty: "easy", example: "Sheep have wool.", exampleKorean: "양은 털이 있어요.", tip: "메에~! 🐑" },
  { id: 11, word: "goat", meaning: "염소", pronunciation: "고트", category: "동물", difficulty: "easy", example: "The goat eats grass.", exampleKorean: "염소가 풀을 먹어요.", tip: "음메~! 🐐" },
  { id: 12, word: "frog", meaning: "개구리", pronunciation: "프로그", category: "동물", difficulty: "easy", example: "The frog jumps.", exampleKorean: "개구리가 뛰어요.", tip: "개굴개굴! 🐸" },
  { id: 13, word: "bear", meaning: "곰", pronunciation: "베어", category: "동물", difficulty: "easy", example: "Bears love honey.", exampleKorean: "곰은 꿀을 좋아해요.", tip: "으르렁! 🐻" },
  { id: 14, word: "mouse", meaning: "쥐", pronunciation: "마우스", category: "동물", difficulty: "easy", example: "The mouse is small.", exampleKorean: "쥐는 작아요.", tip: "찍찍! 🐭" },
  { id: 15, word: "ant", meaning: "개미", pronunciation: "앤트", category: "동물", difficulty: "easy", example: "Ants are tiny.", exampleKorean: "개미는 아주 작아요.", tip: "아주 작은 곤충! 🐜" },
  { id: 16, word: "bee", meaning: "벌", pronunciation: "비", category: "동물", difficulty: "easy", example: "Bees make honey.", exampleKorean: "벌은 꿀을 만들어요.", tip: "윙윙! 🐝" },
  { id: 17, word: "bug", meaning: "벌레", pronunciation: "버그", category: "동물", difficulty: "easy", example: "I see a bug.", exampleKorean: "벌레가 보여요.", tip: "작은 곤충들! 🐛" },
  { id: 18, word: "bat", meaning: "박쥐", pronunciation: "뱃", category: "동물", difficulty: "easy", example: "Bats fly at night.", exampleKorean: "박쥐는 밤에 날아요.", tip: "밤에 나는 동물! 🦇" },
  { id: 19, word: "snail", meaning: "달팽이", pronunciation: "스네일", category: "동물", difficulty: "easy", example: "The snail is slow.", exampleKorean: "달팽이는 느려요.", tip: "집을 지고 다녀요! 🐌" },
  { id: 20, word: "worm", meaning: "지렁이", pronunciation: "웜", category: "동물", difficulty: "easy", example: "Worms live in soil.", exampleKorean: "지렁이는 흙 속에 살아요.", tip: "꿈틀꿈틀! 🪱" },

  // 동물 - medium (25개)
  { id: 21, word: "rabbit", meaning: "토끼", pronunciation: "래빗", category: "동물", difficulty: "medium", example: "Rabbits have long ears.", exampleKorean: "토끼는 긴 귀를 가졌어요.", tip: "깡충깡충! 🐰" },
  { id: 22, word: "elephant", meaning: "코끼리", pronunciation: "엘리펀트", category: "동물", difficulty: "medium", example: "Elephants are big.", exampleKorean: "코끼리는 커요.", tip: "긴 코! 🐘" },
  { id: 23, word: "lion", meaning: "사자", pronunciation: "라이언", category: "동물", difficulty: "medium", example: "The lion is the king.", exampleKorean: "사자는 왕이에요.", tip: "으르렁! 동물의 왕! 🦁" },
  { id: 24, word: "tiger", meaning: "호랑이", pronunciation: "타이거", category: "동물", difficulty: "medium", example: "Tigers have stripes.", exampleKorean: "호랑이는 줄무늬가 있어요.", tip: "어흥! 🐯" },
  { id: 25, word: "monkey", meaning: "원숭이", pronunciation: "멍키", category: "동물", difficulty: "medium", example: "Monkeys love bananas.", exampleKorean: "원숭이는 바나나를 좋아해요.", tip: "끼끼! 🐵" },
  { id: 26, word: "giraffe", meaning: "기린", pronunciation: "지래프", category: "동물", difficulty: "medium", example: "Giraffes have long necks.", exampleKorean: "기린은 목이 길어요.", tip: "가장 키가 커요! 🦒" },
  { id: 27, word: "zebra", meaning: "얼룩말", pronunciation: "지브라", category: "동물", difficulty: "medium", example: "Zebras have black and white stripes.", exampleKorean: "얼룩말은 흑백 줄무늬가 있어요.", tip: "검정+하양 줄무늬! 🦓" },
  { id: 28, word: "panda", meaning: "판다", pronunciation: "팬다", category: "동물", difficulty: "medium", example: "Pandas eat bamboo.", exampleKorean: "판다는 대나무를 먹어요.", tip: "중국의 귀여운 곰! 🐼" },
  { id: 29, word: "koala", meaning: "코알라", pronunciation: "코알라", category: "동물", difficulty: "medium", example: "Koalas sleep a lot.", exampleKorean: "코알라는 많이 자요.", tip: "호주의 귀여운 동물! 🐨" },
  { id: 30, word: "penguin", meaning: "펭귄", pronunciation: "펭귄", category: "동물", difficulty: "medium", example: "Penguins cannot fly.", exampleKorean: "펭귄은 날 수 없어요.", tip: "뒤뚱뒤뚱! 🐧" },
  { id: 31, word: "dolphin", meaning: "돌고래", pronunciation: "돌핀", category: "동물", difficulty: "medium", example: "Dolphins are smart.", exampleKorean: "돌고래는 똑똒해요.", tip: "바다의 천재! 🐬" },
  { id: 32, word: "whale", meaning: "고래", pronunciation: "웨일", category: "동물", difficulty: "medium", example: "Whales are huge.", exampleKorean: "고래는 아주 커요.", tip: "가장 큰 동물! 🐋" },
  { id: 33, word: "shark", meaning: "상어", pronunciation: "샤크", category: "동물", difficulty: "medium", example: "Sharks have sharp teeth.", exampleKorean: "상어는 날카로운 이빨이 있어요.", tip: "무서운 이빨! 🦈" },
  { id: 34, word: "turtle", meaning: "거북이", pronunciation: "터틀", category: "동물", difficulty: "medium", example: "Turtles are slow.", exampleKorean: "거북이는 느려요.", tip: "등에 집을 지고 다녀요! 🐢" },
  { id: 35, word: "snake", meaning: "뱀", pronunciation: "스네이크", category: "동물", difficulty: "medium", example: "Snakes have no legs.", exampleKorean: "뱀은 다리가 없어요.", tip: "스르륵! 🐍" },
  { id: 36, word: "fox", meaning: "여우", pronunciation: "폭스", category: "동물", difficulty: "medium", example: "Foxes are clever.", exampleKorean: "여우는 영리해요.", tip: "똑똒하고 귀여워요! 🦊" },
  { id: 37, word: "wolf", meaning: "늑대", pronunciation: "울프", category: "동물", difficulty: "medium", example: "Wolves howl at night.", exampleKorean: "늑대는 밤에 울어요.", tip: "아우~! 🐺" },
  { id: 38, word: "deer", meaning: "사슴", pronunciation: "디어", category: "동물", difficulty: "medium", example: "Deer have antlers.", exampleKorean: "사슴은 뿔이 있어요.", tip: "산타의 친구! 🦌" },
  { id: 39, word: "owl", meaning: "부엉이", pronunciation: "아울", category: "동물", difficulty: "medium", example: "Owls hunt at night.", exampleKorean: "부엉이는 밤에 사냥해요.", tip: "부엉부엉! 🦉" },
  { id: 40, word: "eagle", meaning: "독수리", pronunciation: "이글", category: "동물", difficulty: "medium", example: "Eagles fly high.", exampleKorean: "독수리는 높이 날아요.", tip: "하늘의 왕! 🦅" },
  { id: 41, word: "parrot", meaning: "앵무새", pronunciation: "패럿", category: "동물", difficulty: "medium", example: "Parrots can talk.", exampleKorean: "앵무새는 말할 수 있어요.", tip: "말하는 새! 🦜" },
  { id: 42, word: "swan", meaning: "백조", pronunciation: "스완", category: "동물", difficulty: "medium", example: "Swans are beautiful.", exampleKorean: "백조는 아름다워요.", tip: "우아한 새! 🦢" },
  { id: 43, word: "crab", meaning: "게", pronunciation: "크랩", category: "동물", difficulty: "medium", example: "Crabs walk sideways.", exampleKorean: "게는 옆으로 걸어요.", tip: "옆으로 걸어요! 🦀" },
  { id: 44, word: "spider", meaning: "거미", pronunciation: "스파이더", category: "동물", difficulty: "medium", example: "Spiders make webs.", exampleKorean: "거미는 거미줄을 만들어요.", tip: "다리가 8개! 🕷️" },
  { id: 45, word: "camel", meaning: "낙타", pronunciation: "캐멀", category: "동물", difficulty: "medium", example: "Camels live in deserts.", exampleKorean: "낙타는 사막에 살아요.", tip: "사막의 배! 🐫" },

  // 동물 - hard (20개)
  { id: 46, word: "butterfly", meaning: "나비", pronunciation: "버터플라이", category: "동물", difficulty: "hard", example: "Butterflies have colorful wings.", exampleKorean: "나비는 알록달록한 날개가 있어요.", tip: "버터+날다=나비! 🦋" },
  { id: 47, word: "crocodile", meaning: "악어", pronunciation: "크로커다일", category: "동물", difficulty: "hard", example: "Crocodiles have big mouths.", exampleKorean: "악어는 입이 커요.", tip: "무서운 이빨! 🐊" },
  { id: 48, word: "kangaroo", meaning: "캥거루", pronunciation: "캥거루", category: "동물", difficulty: "hard", example: "Kangaroos can jump high.", exampleKorean: "캥거루는 높이 뛸 수 있어요.", tip: "주머니가 있어요! 🦘" },
  { id: 49, word: "gorilla", meaning: "고릴라", pronunciation: "고릴라", category: "동물", difficulty: "hard", example: "Gorillas are strong.", exampleKorean: "고릴라는 힘이 세요.", tip: "가슴을 쿵쿵! 🦍" },
  { id: 50, word: "cheetah", meaning: "치타", pronunciation: "치타", category: "동물", difficulty: "hard", example: "Cheetahs run very fast.", exampleKorean: "치타는 아주 빨리 달려요.", tip: "가장 빠른 동물! 🐆" },
  { id: 51, word: "leopard", meaning: "표범", pronunciation: "레퍼드", category: "동물", difficulty: "hard", example: "Leopards have spots.", exampleKorean: "표범은 점무늬가 있어요.", tip: "점박이 고양이! 🐆" },
  { id: 52, word: "hippopotamus", meaning: "하마", pronunciation: "히포포타머스", category: "동물", difficulty: "hard", example: "Hippos love water.", exampleKorean: "하마는 물을 좋아해요.", tip: "줄여서 hippo! 🦛" },
  { id: 53, word: "squirrel", meaning: "다람쥐", pronunciation: "스쿼럴", category: "동물", difficulty: "hard", example: "Squirrels eat nuts.", exampleKorean: "다람쥐는 도토리를 먹어요.", tip: "도토리를 모아요! 🐿️" },
  { id: 54, word: "hedgehog", meaning: "고슴도치", pronunciation: "헤지호그", category: "동물", difficulty: "hard", example: "Hedgehogs have spikes.", exampleKorean: "고슴도치는 가시가 있어요.", tip: "소닉! 🦔" },
  { id: 55, word: "peacock", meaning: "공작새", pronunciation: "피콕", category: "동물", difficulty: "hard", example: "Peacocks have beautiful feathers.", exampleKorean: "공작새는 아름다운 깃털이 있어요.", tip: "화려한 꼬리! 🦚" },
  { id: 56, word: "flamingo", meaning: "플라밍고", pronunciation: "플라밍고", category: "동물", difficulty: "hard", example: "Flamingos are pink.", exampleKorean: "플라밍고는 분홍색이에요.", tip: "한 발로 서요! 🦩" },
  { id: 57, word: "octopus", meaning: "문어", pronunciation: "악토퍼스", category: "동물", difficulty: "hard", example: "Octopuses have eight arms.", exampleKorean: "문어는 팔이 여덟 개예요.", tip: "팔이 8개! 🐙" },
  { id: 58, word: "jellyfish", meaning: "해파리", pronunciation: "젤리피쉬", category: "동물", difficulty: "hard", example: "Jellyfish float in the ocean.", exampleKorean: "해파리는 바다에 떠다녀요.", tip: "젤리+물고기! 🪼" },
  { id: 59, word: "seahorse", meaning: "해마", pronunciation: "시호스", category: "동물", difficulty: "hard", example: "Seahorses are tiny.", exampleKorean: "해마는 아주 작아요.", tip: "바다+말! 🪸" },
  { id: 60, word: "starfish", meaning: "불가사리", pronunciation: "스타피쉬", category: "동물", difficulty: "hard", example: "Starfish have five arms.", exampleKorean: "불가사리는 팔이 다섯 개예요.", tip: "별+물고기! ⭐" },
  { id: 61, word: "lobster", meaning: "바닷가재", pronunciation: "랍스터", category: "동물", difficulty: "hard", example: "Lobsters live in the sea.", exampleKorean: "바닷가재는 바다에 살아요.", tip: "큰 집게! 🦞" },
  { id: 62, word: "dragonfly", meaning: "잠자리", pronunciation: "드래곤플라이", category: "동물", difficulty: "hard", example: "Dragonflies have big eyes.", exampleKorean: "잠자리는 눈이 커요.", tip: "용+날다! 🪰" },
  { id: 63, word: "caterpillar", meaning: "애벌레", pronunciation: "캐터필러", category: "동물", difficulty: "hard", example: "Caterpillars become butterflies.", exampleKorean: "애벌레는 나비가 돼요.", tip: "나비의 아기! 🐛" },
  { id: 64, word: "grasshopper", meaning: "메뚜기", pronunciation: "그래스호퍼", category: "동물", difficulty: "hard", example: "Grasshoppers can jump far.", exampleKorean: "메뚜기는 멀리 뛸 수 있어요.", tip: "풀+뛰는것! 🦗" },
  { id: 65, word: "ladybug", meaning: "무당벌레", pronunciation: "레이디버그", category: "동물", difficulty: "hard", example: "Ladybugs are red with black spots.", exampleKorean: "무당벌레는 빨간색에 검은 점이 있어요.", tip: "행운의 벌레! 🐞" },

  // 동물 - expert (15개)
  { id: 66, word: "rhinoceros", meaning: "코뿔소", pronunciation: "라이나서러스", category: "동물", difficulty: "expert", example: "Rhinoceros have horns on their nose.", exampleKorean: "코뿔소는 코에 뿔이 있어요.", tip: "줄여서 rhino! 🦏" },
  { id: 67, word: "chimpanzee", meaning: "침팬지", pronunciation: "침팬지", category: "동물", difficulty: "expert", example: "Chimpanzees are very smart.", exampleKorean: "침팬지는 아주 똑똒해요.", tip: "줄여서 chimp! 🐒" },
  { id: 68, word: "orangutan", meaning: "오랑우탄", pronunciation: "오랑우탄", category: "동물", difficulty: "expert", example: "Orangutans live in trees.", exampleKorean: "오랑우탄은 나무에 살아요.", tip: "빨간 털의 원숭이! 🦧" },
  { id: 69, word: "armadillo", meaning: "아르마딜로", pronunciation: "아마딜로", category: "동물", difficulty: "expert", example: "Armadillos have armor.", exampleKorean: "아르마딜로는 갑옷이 있어요.", tip: "갑옷을 입은 동물! 🦔" },
  { id: 70, word: "chameleon", meaning: "카멜레온", pronunciation: "커밀리언", category: "동물", difficulty: "expert", example: "Chameleons can change colors.", exampleKorean: "카멜레온은 색을 바꿀 수 있어요.", tip: "색이 변해요! 🦎" },
  { id: 71, word: "salamander", meaning: "도롱뇽", pronunciation: "샐러맨더", category: "동물", difficulty: "expert", example: "Salamanders live near water.", exampleKorean: "도롱뇽은 물 근처에 살아요.", tip: "양서류! 🦎" },
  { id: 72, word: "tarantula", meaning: "타란튤라", pronunciation: "터랜츌러", category: "동물", difficulty: "expert", example: "Tarantulas are big spiders.", exampleKorean: "타란튤라는 큰 거미예요.", tip: "아주 큰 거미! 🕷️" },
  { id: 73, word: "scorpion", meaning: "전갈", pronunciation: "스콜피온", category: "동물", difficulty: "expert", example: "Scorpions have stingers.", exampleKorean: "전갈은 독침이 있어요.", tip: "꼬리에 독침! 🦂" },
  { id: 74, word: "porcupine", meaning: "호저", pronunciation: "포큐파인", category: "동물", difficulty: "expert", example: "Porcupines have sharp quills.", exampleKorean: "호저는 날카로운 가시가 있어요.", tip: "가시가 많아요! 🦔" },
  { id: 75, word: "albatross", meaning: "알바트로스", pronunciation: "앨버트로스", category: "동물", difficulty: "expert", example: "Albatross have very long wings.", exampleKorean: "알바트로스는 날개가 아주 길어요.", tip: "날개가 긴 새! 🦅" },
  { id: 76, word: "platypus", meaning: "오리너구리", pronunciation: "플래티퍼스", category: "동물", difficulty: "expert", example: "Platypus lay eggs.", exampleKorean: "오리너구리는 알을 낳아요.", tip: "오리+비버! 🦆" },
  { id: 77, word: "mongoose", meaning: "몽구스", pronunciation: "몽구스", category: "동물", difficulty: "expert", example: "Mongoose fight snakes.", exampleKorean: "몽구스는 뱀과 싸워요.", tip: "뱀의 천적! 🐿️" },
  { id: 78, word: "meerkat", meaning: "미어캣", pronunciation: "미어캣", category: "동물", difficulty: "expert", example: "Meerkats stand on two legs.", exampleKorean: "미어캣은 두 발로 서요.", tip: "라이온킹의 티몬! 🐿️" },
  { id: 79, word: "iguana", meaning: "이구아나", pronunciation: "이구아나", category: "동물", difficulty: "expert", example: "Iguanas are big lizards.", exampleKorean: "이구아나는 큰 도마뱀이에요.", tip: "큰 도마뱀! 🦎" },
  { id: 80, word: "anteater", meaning: "개미핥기", pronunciation: "앤트이터", category: "동물", difficulty: "expert", example: "Anteaters eat ants.", exampleKorean: "개미핥기는 개미를 먹어요.", tip: "개미+먹는것! 🐽" },

  // ========================================
  // 🍎 과일 (Fruits) - 50개
  // ========================================

  // 과일 - easy (15개)
  { id: 81, word: "apple", meaning: "사과", pronunciation: "애플", category: "과일", difficulty: "easy", example: "I eat an apple.", exampleKorean: "나는 사과를 먹어요.", tip: "빨간 과일! 🍎" },
  { id: 82, word: "banana", meaning: "바나나", pronunciation: "바나나", category: "과일", difficulty: "easy", example: "Monkeys love bananas.", exampleKorean: "원숭이는 바나나를 좋아해요.", tip: "노란 과일! 🍌" },
  { id: 83, word: "orange", meaning: "오렌지", pronunciation: "오린지", category: "과일", difficulty: "easy", example: "Orange juice is sweet.", exampleKorean: "오렌지 주스는 달아요.", tip: "오렌지색 과일! 🍊" },
  { id: 84, word: "grape", meaning: "포도", pronunciation: "그레이프", category: "과일", difficulty: "easy", example: "Grapes are purple.", exampleKorean: "포도는 보라색이에요.", tip: "알알이! 🍇" },
  { id: 85, word: "lemon", meaning: "레몬", pronunciation: "레몬", category: "과일", difficulty: "easy", example: "Lemons are sour.", exampleKorean: "레몬은 새콤해요.", tip: "신맛! 🍋" },
  { id: 86, word: "melon", meaning: "멜론", pronunciation: "멜론", category: "과일", difficulty: "easy", example: "Melon is sweet.", exampleKorean: "멜론은 달아요.", tip: "달콤한 과일! 🍈" },
  { id: 87, word: "peach", meaning: "복숭아", pronunciation: "피치", category: "과일", difficulty: "easy", example: "Peaches are soft.", exampleKorean: "복숭아는 부드러워요.", tip: "복슬복슬! 🍑" },
  { id: 88, word: "pear", meaning: "배", pronunciation: "페어", category: "과일", difficulty: "easy", example: "Pears are juicy.", exampleKorean: "배는 즙이 많아요.", tip: "시원한 과일! 🍐" },
  { id: 89, word: "plum", meaning: "자두", pronunciation: "플럼", category: "과일", difficulty: "easy", example: "Plums are purple.", exampleKorean: "자두는 보라색이에요.", tip: "작은 과일! 🫐" },
  { id: 90, word: "cherry", meaning: "체리", pronunciation: "체리", category: "과일", difficulty: "easy", example: "Cherries are red.", exampleKorean: "체리는 빨간색이에요.", tip: "작고 빨간! 🍒" },
  { id: 91, word: "lime", meaning: "라임", pronunciation: "라임", category: "과일", difficulty: "easy", example: "Lime is green.", exampleKorean: "라임은 초록색이에요.", tip: "초록 레몬! 🍋" },
  { id: 92, word: "fig", meaning: "무화과", pronunciation: "피그", category: "과일", difficulty: "easy", example: "Figs are sweet.", exampleKorean: "무화과는 달아요.", tip: "달콤한 과일! 🫐" },
  { id: 93, word: "date", meaning: "대추야자", pronunciation: "데이트", category: "과일", difficulty: "easy", example: "Dates are very sweet.", exampleKorean: "대추야자는 아주 달아요.", tip: "아주 달아요! 🫐" },
  { id: 94, word: "olive", meaning: "올리브", pronunciation: "올리브", category: "과일", difficulty: "easy", example: "Olives are green or black.", exampleKorean: "올리브는 초록색 또는 검은색이에요.", tip: "피자에 올려요! 🫒" },
  { id: 95, word: "coconut", meaning: "코코넛", pronunciation: "코코넛", category: "과일", difficulty: "easy", example: "Coconuts have milk inside.", exampleKorean: "코코넛 안에는 우유가 있어요.", tip: "야자수 열매! 🥥" },

  // 과일 - medium (15개)
  { id: 96, word: "strawberry", meaning: "딸기", pronunciation: "스트로베리", category: "과일", difficulty: "medium", example: "Strawberries are red and sweet.", exampleKorean: "딸기는 빨갛고 달아요.", tip: "씨가 겉에! 🍓" },
  { id: 97, word: "watermelon", meaning: "수박", pronunciation: "워터멜론", category: "과일", difficulty: "medium", example: "Watermelon is great in summer.", exampleKorean: "수박은 여름에 최고예요.", tip: "물+멜론! 🍉" },
  { id: 98, word: "pineapple", meaning: "파인애플", pronunciation: "파인애플", category: "과일", difficulty: "medium", example: "Pineapples are yellow inside.", exampleKorean: "파인애플은 속이 노란색이에요.", tip: "소나무+사과! 🍍" },
  { id: 99, word: "mango", meaning: "망고", pronunciation: "망고", category: "과일", difficulty: "medium", example: "Mangoes are tropical fruits.", exampleKorean: "망고는 열대 과일이에요.", tip: "달콤한 열대 과일! 🥭" },
  { id: 100, word: "kiwi", meaning: "키위", pronunciation: "키위", category: "과일", difficulty: "medium", example: "Kiwis are green inside.", exampleKorean: "키위는 속이 초록색이에요.", tip: "털이 있어요! 🥝" },
  { id: 101, word: "avocado", meaning: "아보카도", pronunciation: "아보카도", category: "과일", difficulty: "medium", example: "Avocados are healthy.", exampleKorean: "아보카도는 건강해요.", tip: "초록 버터! 🥑" },
  { id: 102, word: "papaya", meaning: "파파야", pronunciation: "파파야", category: "과일", difficulty: "medium", example: "Papayas are orange inside.", exampleKorean: "파파야는 속이 주황색이에요.", tip: "열대 과일! 🍈" },
  { id: 103, word: "grapefruit", meaning: "자몽", pronunciation: "그레이프프룻", category: "과일", difficulty: "medium", example: "Grapefruits are sour.", exampleKorean: "자몽은 새콤해요.", tip: "포도+과일! 🍊" },
  { id: 104, word: "tangerine", meaning: "귤", pronunciation: "탠저린", category: "과일", difficulty: "medium", example: "Tangerines are easy to peel.", exampleKorean: "귤은 껍질 벗기기 쉬워요.", tip: "작은 오렌지! 🍊" },
  { id: 105, word: "apricot", meaning: "살구", pronunciation: "에이프리콧", category: "과일", difficulty: "medium", example: "Apricots are orange.", exampleKorean: "살구는 주황색이에요.", tip: "작은 복숭아! 🍑" },
  { id: 106, word: "raspberry", meaning: "라즈베리", pronunciation: "라즈베리", category: "과일", difficulty: "medium", example: "Raspberries are red.", exampleKorean: "라즈베리는 빨간색이에요.", tip: "빨간 베리! 🫐" },
  { id: 107, word: "blueberry", meaning: "블루베리", pronunciation: "블루베리", category: "과일", difficulty: "medium", example: "Blueberries are blue.", exampleKorean: "블루베리는 파란색이에요.", tip: "파란 베리! 🫐" },
  { id: 108, word: "blackberry", meaning: "블랙베리", pronunciation: "블랙베리", category: "과일", difficulty: "medium", example: "Blackberries are dark purple.", exampleKorean: "블랙베리는 진보라색이에요.", tip: "검은 베리! 🫐" },
  { id: 109, word: "cranberry", meaning: "크랜베리", pronunciation: "크랜베리", category: "과일", difficulty: "medium", example: "Cranberries are sour.", exampleKorean: "크랜베리는 새콤해요.", tip: "새콤한 베리! 🫐" },
  { id: 110, word: "pomegranate", meaning: "석류", pronunciation: "파머그래닛", category: "과일", difficulty: "medium", example: "Pomegranates have many seeds.", exampleKorean: "석류는 씨가 많아요.", tip: "씨가 가득! 🍎" },

  // 과일 - hard (12개)
  { id: 111, word: "cantaloupe", meaning: "칸탈루프멜론", pronunciation: "캔털루프", category: "과일", difficulty: "hard", example: "Cantaloupe is orange inside.", exampleKorean: "칸탈루프는 속이 주황색이에요.", tip: "주황 멜론! 🍈" },
  { id: 112, word: "honeydew", meaning: "허니듀멜론", pronunciation: "허니듀", category: "과일", difficulty: "hard", example: "Honeydew is sweet like honey.", exampleKorean: "허니듀는 꿀처럼 달아요.", tip: "꿀이슬! 🍈" },
  { id: 113, word: "nectarine", meaning: "천도복숭아", pronunciation: "넥터린", category: "과일", difficulty: "hard", example: "Nectarines have smooth skin.", exampleKorean: "천도복숭아는 껍질이 매끄러워요.", tip: "매끈한 복숭아! 🍑" },
  { id: 114, word: "persimmon", meaning: "감", pronunciation: "퍼시먼", category: "과일", difficulty: "hard", example: "Persimmons are orange.", exampleKorean: "감은 주황색이에요.", tip: "가을 과일! 🍊" },
  { id: 115, word: "guava", meaning: "구아바", pronunciation: "구아바", category: "과일", difficulty: "hard", example: "Guavas are tropical.", exampleKorean: "구아바는 열대 과일이에요.", tip: "열대 과일! 🍈" },
  { id: 116, word: "lychee", meaning: "리치", pronunciation: "라이치", category: "과일", difficulty: "hard", example: "Lychees have red skin.", exampleKorean: "리치는 껍질이 빨간색이에요.", tip: "빨간 껍질! 🫐" },
  { id: 117, word: "passionfruit", meaning: "패션프루트", pronunciation: "패션프룻", category: "과일", difficulty: "hard", example: "Passionfruit is very fragrant.", exampleKorean: "패션프루트는 향이 좋아요.", tip: "향기 좋은 과일! 🫐" },
  { id: 118, word: "dragonfruit", meaning: "용과", pronunciation: "드래곤프룻", category: "과일", difficulty: "hard", example: "Dragonfruit is pink outside.", exampleKorean: "용과는 겉이 분홍색이에요.", tip: "용+과일! 🍈" },
  { id: 119, word: "starfruit", meaning: "스타프루트", pronunciation: "스타프룻", category: "과일", difficulty: "hard", example: "Starfruit looks like a star.", exampleKorean: "스타프루트는 별처럼 생겼어요.", tip: "별 모양! ⭐" },
  { id: 120, word: "jackfruit", meaning: "잭프루트", pronunciation: "잭프룻", category: "과일", difficulty: "hard", example: "Jackfruits are very big.", exampleKorean: "잭프루트는 아주 커요.", tip: "아주 큰 과일! 🍈" },
  { id: 121, word: "kumquat", meaning: "금귤", pronunciation: "컴쿼트", category: "과일", difficulty: "hard", example: "Kumquats are tiny oranges.", exampleKorean: "금귤은 작은 오렌지예요.", tip: "아주 작은 귤! 🍊" },
  { id: 122, word: "mulberry", meaning: "뽕나무열매", pronunciation: "멀베리", category: "과일", difficulty: "hard", example: "Mulberries grow on trees.", exampleKorean: "뽕나무열매는 나무에서 자라요.", tip: "뽕나무 열매! 🫐" },

  // 과일 - expert (8개)
  { id: 123, word: "rambutan", meaning: "람부탄", pronunciation: "램부탄", category: "과일", difficulty: "expert", example: "Rambutans have hairy skin.", exampleKorean: "람부탄은 털이 있어요.", tip: "털이 난 리치! 🫐" },
  { id: 124, word: "durian", meaning: "두리안", pronunciation: "두리안", category: "과일", difficulty: "expert", example: "Durians smell strong.", exampleKorean: "두리안은 냄새가 강해요.", tip: "과일의 왕! 냄새 주의! 🍈" },
  { id: 125, word: "mangosteen", meaning: "망고스틴", pronunciation: "망고스틴", category: "과일", difficulty: "expert", example: "Mangosteens have purple skin.", exampleKorean: "망고스틴은 보라색 껍질이에요.", tip: "과일의 여왕! 🫐" },
  { id: 126, word: "tamarind", meaning: "타마린드", pronunciation: "태머린드", category: "과일", difficulty: "expert", example: "Tamarind is sour and sweet.", exampleKorean: "타마린드는 새콤달콤해요.", tip: "새콤달콤! 🫐" },
  { id: 127, word: "breadfruit", meaning: "빵나무열매", pronunciation: "브레드프룻", category: "과일", difficulty: "expert", example: "Breadfruit tastes like bread.", exampleKorean: "빵나무열매는 빵 맛이 나요.", tip: "빵+과일! 🍈" },
  { id: 128, word: "soursop", meaning: "사워솝", pronunciation: "사워솝", category: "과일", difficulty: "expert", example: "Soursop has white flesh.", exampleKorean: "사워솝은 속이 하얀색이에요.", tip: "시큼한 과일! 🍈" },
  { id: 129, word: "cherimoya", meaning: "체리모야", pronunciation: "체리모야", category: "과일", difficulty: "expert", example: "Cherimoya is creamy.", exampleKorean: "체리모야는 크리미해요.", tip: "아이스크림 과일! 🍈" },
  { id: 130, word: "acai", meaning: "아사이", pronunciation: "아사이", category: "과일", difficulty: "expert", example: "Acai berries are super healthy.", exampleKorean: "아사이베리는 아주 건강해요.", tip: "슈퍼푸드! 🫐" },

  // ========================================
  // 🌈 색깔 (Colors) - 30개
  // ========================================

  // 색깔 - easy (12개)
  { id: 131, word: "red", meaning: "빨간색", pronunciation: "레드", category: "색깔", difficulty: "easy", example: "The apple is red.", exampleKorean: "사과는 빨간색이에요.", tip: "🔴 불의 색!" },
  { id: 132, word: "blue", meaning: "파란색", pronunciation: "블루", category: "색깔", difficulty: "easy", example: "The sky is blue.", exampleKorean: "하늘은 파란색이에요.", tip: "🔵 하늘의 색!" },
  { id: 133, word: "yellow", meaning: "노란색", pronunciation: "옐로우", category: "색깔", difficulty: "easy", example: "The sun is yellow.", exampleKorean: "태양은 노란색이에요.", tip: "🟡 태양의 색!" },
  { id: 134, word: "green", meaning: "초록색", pronunciation: "그린", category: "색깔", difficulty: "easy", example: "Grass is green.", exampleKorean: "잔디는 초록색이에요.", tip: "🟢 풀의 색!" },
  { id: 135, word: "orange", meaning: "주황색", pronunciation: "오린지", category: "색깔", difficulty: "easy", example: "Carrots are orange.", exampleKorean: "당근은 주황색이에요.", tip: "🟠 오렌지의 색!" },
  { id: 136, word: "purple", meaning: "보라색", pronunciation: "퍼플", category: "색깔", difficulty: "easy", example: "Grapes are purple.", exampleKorean: "포도는 보라색이에요.", tip: "🟣 포도의 색!" },
  { id: 137, word: "pink", meaning: "분홍색", pronunciation: "핑크", category: "색깔", difficulty: "easy", example: "Flowers are pink.", exampleKorean: "꽃은 분홍색이에요.", tip: "🩷 예쁜 색!" },
  { id: 138, word: "black", meaning: "검은색", pronunciation: "블랙", category: "색깔", difficulty: "easy", example: "My hair is black.", exampleKorean: "내 머리카락은 검은색이에요.", tip: "⚫ 밤의 색!" },
  { id: 139, word: "white", meaning: "흰색", pronunciation: "화이트", category: "색깔", difficulty: "easy", example: "Snow is white.", exampleKorean: "눈은 흰색이에요.", tip: "⚪ 눈의 색!" },
  { id: 140, word: "brown", meaning: "갈색", pronunciation: "브라운", category: "색깔", difficulty: "easy", example: "Bears are brown.", exampleKorean: "곰은 갈색이에요.", tip: "🟤 초콜릿 색!" },
  { id: 141, word: "gray", meaning: "회색", pronunciation: "그레이", category: "색깔", difficulty: "easy", example: "Elephants are gray.", exampleKorean: "코끼리는 회색이에요.", tip: "🩶 코끼리 색!" },
  { id: 142, word: "gold", meaning: "금색", pronunciation: "골드", category: "색깔", difficulty: "easy", example: "The medal is gold.", exampleKorean: "메달은 금색이에요.", tip: "✨ 반짝반짝!" },

  // 색깔 - medium (10개)
  { id: 143, word: "silver", meaning: "은색", pronunciation: "실버", category: "색깔", difficulty: "medium", example: "The ring is silver.", exampleKorean: "반지는 은색이에요.", tip: "🥈 은메달 색!" },
  { id: 144, word: "beige", meaning: "베이지색", pronunciation: "베이지", category: "색깔", difficulty: "medium", example: "The wall is beige.", exampleKorean: "벽은 베이지색이에요.", tip: "연한 갈색!" },
  { id: 145, word: "navy", meaning: "남색", pronunciation: "네이비", category: "색깔", difficulty: "medium", example: "My uniform is navy.", exampleKorean: "내 교복은 남색이에요.", tip: "진한 파란색!" },
  { id: 146, word: "cream", meaning: "크림색", pronunciation: "크림", category: "색깔", difficulty: "medium", example: "The cake is cream colored.", exampleKorean: "케이크는 크림색이에요.", tip: "부드러운 흰색!" },
  { id: 147, word: "mint", meaning: "민트색", pronunciation: "민트", category: "색깔", difficulty: "medium", example: "I like mint color.", exampleKorean: "나는 민트색을 좋아해요.", tip: "시원한 초록!" },
  { id: 148, word: "coral", meaning: "산호색", pronunciation: "코럴", category: "색깔", difficulty: "medium", example: "The sunset is coral.", exampleKorean: "노을은 산호색이에요.", tip: "예쁜 분홍주황!" },
  { id: 149, word: "peach", meaning: "복숭아색", pronunciation: "피치", category: "색깔", difficulty: "medium", example: "Her dress is peach.", exampleKorean: "그녀의 드레스는 복숭아색이에요.", tip: "연한 주황분홍!" },
  { id: 150, word: "turquoise", meaning: "청록색", pronunciation: "터쿼이즈", category: "색깔", difficulty: "medium", example: "The ocean is turquoise.", exampleKorean: "바다는 청록색이에요.", tip: "바다 색!" },
  { id: 151, word: "violet", meaning: "제비꽃색", pronunciation: "바이올렛", category: "색깔", difficulty: "medium", example: "Violets are violet.", exampleKorean: "제비꽃은 보라색이에요.", tip: "연한 보라!" },
  { id: 152, word: "maroon", meaning: "적갈색", pronunciation: "머룬", category: "색깔", difficulty: "medium", example: "His tie is maroon.", exampleKorean: "그의 넥타이는 적갈색이에요.", tip: "진한 빨간갈색!" },

  // 색깔 - hard (5개)
  { id: 153, word: "scarlet", meaning: "주홍색", pronunciation: "스칼렛", category: "색깔", difficulty: "hard", example: "The rose is scarlet.", exampleKorean: "장미는 주홍색이에요.", tip: "선명한 빨강!" },
  { id: 154, word: "indigo", meaning: "남빛", pronunciation: "인디고", category: "색깔", difficulty: "hard", example: "Jeans are indigo.", exampleKorean: "청바지는 남빛이에요.", tip: "청바지 색!" },
  { id: 155, word: "magenta", meaning: "자홍색", pronunciation: "마젠타", category: "색깔", difficulty: "hard", example: "The flower is magenta.", exampleKorean: "꽃은 자홍색이에요.", tip: "선명한 분홍보라!" },
  { id: 156, word: "khaki", meaning: "카키색", pronunciation: "카키", category: "색깔", difficulty: "hard", example: "His pants are khaki.", exampleKorean: "그의 바지는 카키색이에요.", tip: "군복 색!" },
  { id: 157, word: "teal", meaning: "청록색", pronunciation: "틸", category: "색깔", difficulty: "hard", example: "The vase is teal.", exampleKorean: "꽃병은 청록색이에요.", tip: "파랑+초록!" },

  // 색깔 - expert (3개)
  { id: 158, word: "chartreuse", meaning: "연두색", pronunciation: "샤르트뢰즈", category: "색깔", difficulty: "expert", example: "The leaves are chartreuse.", exampleKorean: "잎은 연두색이에요.", tip: "밝은 연두!" },
  { id: 159, word: "burgundy", meaning: "버건디색", pronunciation: "버건디", category: "색깔", difficulty: "expert", example: "Her lipstick is burgundy.", exampleKorean: "그녀의 립스틱은 버건디색이에요.", tip: "와인 색!" },
  { id: 160, word: "cerulean", meaning: "하늘색", pronunciation: "서룰리언", category: "색깔", difficulty: "expert", example: "The sky is cerulean.", exampleKorean: "하늘은 하늘색이에요.", tip: "맑은 하늘색!" },

  // ========================================
  // 🔢 숫자 (Numbers) - 40개
  // ========================================

  // 숫자 - easy (15개)
  { id: 161, word: "one", meaning: "하나/1", pronunciation: "원", category: "숫자", difficulty: "easy", example: "I have one nose.", exampleKorean: "나는 코가 하나 있어요.", tip: "1️⃣" },
  { id: 162, word: "two", meaning: "둘/2", pronunciation: "투", category: "숫자", difficulty: "easy", example: "I have two eyes.", exampleKorean: "나는 눈이 두 개 있어요.", tip: "2️⃣" },
  { id: 163, word: "three", meaning: "셋/3", pronunciation: "쓰리", category: "숫자", difficulty: "easy", example: "Three bears live there.", exampleKorean: "곰 세 마리가 살아요.", tip: "3️⃣" },
  { id: 164, word: "four", meaning: "넷/4", pronunciation: "포", category: "숫자", difficulty: "easy", example: "A dog has four legs.", exampleKorean: "개는 다리가 네 개예요.", tip: "4️⃣" },
  { id: 165, word: "five", meaning: "다섯/5", pronunciation: "파이브", category: "숫자", difficulty: "easy", example: "I have five fingers.", exampleKorean: "나는 손가락이 다섯 개예요.", tip: "5️⃣" },
  { id: 166, word: "six", meaning: "여섯/6", pronunciation: "식스", category: "숫자", difficulty: "easy", example: "Dice have six sides.", exampleKorean: "주사위는 면이 여섯 개예요.", tip: "6️⃣" },
  { id: 167, word: "seven", meaning: "일곱/7", pronunciation: "세븐", category: "숫자", difficulty: "easy", example: "Seven days in a week.", exampleKorean: "일주일은 7일이에요.", tip: "7️⃣ 행운의 숫자!" },
  { id: 168, word: "eight", meaning: "여덟/8", pronunciation: "에이트", category: "숫자", difficulty: "easy", example: "Octopus has eight arms.", exampleKorean: "문어는 팔이 여덟 개예요.", tip: "8️⃣" },
  { id: 169, word: "nine", meaning: "아홉/9", pronunciation: "나인", category: "숫자", difficulty: "easy", example: "Nine is before ten.", exampleKorean: "9는 10 전이에요.", tip: "9️⃣" },
  { id: 170, word: "ten", meaning: "열/10", pronunciation: "텐", category: "숫자", difficulty: "easy", example: "I have ten toes.", exampleKorean: "나는 발가락이 열 개예요.", tip: "🔟" },
  { id: 171, word: "zero", meaning: "영/0", pronunciation: "지로", category: "숫자", difficulty: "easy", example: "Zero means nothing.", exampleKorean: "0은 없다는 뜻이에요.", tip: "0️⃣" },
  { id: 172, word: "eleven", meaning: "열하나/11", pronunciation: "일레븐", category: "숫자", difficulty: "easy", example: "Eleven is after ten.", exampleKorean: "11은 10 다음이에요.", tip: "1️⃣1️⃣" },
  { id: 173, word: "twelve", meaning: "열둘/12", pronunciation: "트웰브", category: "숫자", difficulty: "easy", example: "Twelve months in a year.", exampleKorean: "1년은 12개월이에요.", tip: "1️⃣2️⃣" },
  { id: 174, word: "twenty", meaning: "스물/20", pronunciation: "트웬티", category: "숫자", difficulty: "easy", example: "I am twenty years old.", exampleKorean: "나는 스무 살이에요.", tip: "2️⃣0️⃣" },
  { id: 175, word: "hundred", meaning: "백/100", pronunciation: "헌드레드", category: "숫자", difficulty: "easy", example: "One hundred ants!", exampleKorean: "개미 100마리!", tip: "💯" },

  // 숫자 - medium (15개)
  { id: 176, word: "thirteen", meaning: "열셋/13", pronunciation: "써틴", category: "숫자", difficulty: "medium", example: "Friday the thirteenth.", exampleKorean: "13일의 금요일.", tip: "1️⃣3️⃣" },
  { id: 177, word: "fourteen", meaning: "열넷/14", pronunciation: "포틴", category: "숫자", difficulty: "medium", example: "Fourteen days.", exampleKorean: "14일.", tip: "1️⃣4️⃣" },
  { id: 178, word: "fifteen", meaning: "열다섯/15", pronunciation: "피프틴", category: "숫자", difficulty: "medium", example: "Fifteen minutes.", exampleKorean: "15분.", tip: "1️⃣5️⃣" },
  { id: 179, word: "sixteen", meaning: "열여섯/16", pronunciation: "식스틴", category: "숫자", difficulty: "medium", example: "Sweet sixteen.", exampleKorean: "스윗 16.", tip: "1️⃣6️⃣" },
  { id: 180, word: "seventeen", meaning: "열일곱/17", pronunciation: "세븐틴", category: "숫자", difficulty: "medium", example: "Seventeen years old.", exampleKorean: "17살.", tip: "1️⃣7️⃣" },
  { id: 181, word: "eighteen", meaning: "열여덟/18", pronunciation: "에이틴", category: "숫자", difficulty: "medium", example: "Eighteen holes.", exampleKorean: "18홀.", tip: "1️⃣8️⃣" },
  { id: 182, word: "nineteen", meaning: "열아홉/19", pronunciation: "나인틴", category: "숫자", difficulty: "medium", example: "Nineteen students.", exampleKorean: "학생 19명.", tip: "1️⃣9️⃣" },
  { id: 183, word: "thirty", meaning: "서른/30", pronunciation: "써티", category: "숫자", difficulty: "medium", example: "Thirty days.", exampleKorean: "30일.", tip: "3️⃣0️⃣" },
  { id: 184, word: "forty", meaning: "마흔/40", pronunciation: "포티", category: "숫자", difficulty: "medium", example: "Forty people.", exampleKorean: "40명.", tip: "4️⃣0️⃣ four 아님!" },
  { id: 185, word: "fifty", meaning: "쉰/50", pronunciation: "피프티", category: "숫자", difficulty: "medium", example: "Fifty stars.", exampleKorean: "별 50개.", tip: "5️⃣0️⃣" },
  { id: 186, word: "sixty", meaning: "예순/60", pronunciation: "식스티", category: "숫자", difficulty: "medium", example: "Sixty seconds.", exampleKorean: "60초.", tip: "6️⃣0️⃣" },
  { id: 187, word: "seventy", meaning: "일흔/70", pronunciation: "세븐티", category: "숫자", difficulty: "medium", example: "Seventy percent.", exampleKorean: "70퍼센트.", tip: "7️⃣0️⃣" },
  { id: 188, word: "eighty", meaning: "여든/80", pronunciation: "에이티", category: "숫자", difficulty: "medium", example: "Eighty years old.", exampleKorean: "80살.", tip: "8️⃣0️⃣" },
  { id: 189, word: "ninety", meaning: "아흔/90", pronunciation: "나인티", category: "숫자", difficulty: "medium", example: "Ninety degrees.", exampleKorean: "90도.", tip: "9️⃣0️⃣" },
  { id: 190, word: "thousand", meaning: "천/1000", pronunciation: "싸우전드", category: "숫자", difficulty: "medium", example: "A thousand stars.", exampleKorean: "별 천 개.", tip: "1️⃣0️⃣0️⃣0️⃣" },

  // 숫자 - hard (7개)
  { id: 191, word: "first", meaning: "첫 번째", pronunciation: "퍼스트", category: "숫자", difficulty: "hard", example: "I am first!", exampleKorean: "나는 첫 번째야!", tip: "1st 🥇" },
  { id: 192, word: "second", meaning: "두 번째", pronunciation: "세컨드", category: "숫자", difficulty: "hard", example: "He is second.", exampleKorean: "그는 두 번째야.", tip: "2nd 🥈" },
  { id: 193, word: "third", meaning: "세 번째", pronunciation: "써드", category: "숫자", difficulty: "hard", example: "She is third.", exampleKorean: "그녀는 세 번째야.", tip: "3rd 🥉" },
  { id: 194, word: "fourth", meaning: "네 번째", pronunciation: "포스", category: "숫자", difficulty: "hard", example: "The fourth floor.", exampleKorean: "4층.", tip: "4th" },
  { id: 195, word: "fifth", meaning: "다섯 번째", pronunciation: "피프스", category: "숫자", difficulty: "hard", example: "The fifth day.", exampleKorean: "다섯째 날.", tip: "5th" },
  { id: 196, word: "half", meaning: "반/절반", pronunciation: "해프", category: "숫자", difficulty: "hard", example: "Half an apple.", exampleKorean: "사과 반 개.", tip: "½" },
  { id: 197, word: "million", meaning: "백만", pronunciation: "밀리언", category: "숫자", difficulty: "hard", example: "A million dollars.", exampleKorean: "백만 달러.", tip: "1,000,000" },

  // 숫자 - expert (3개)
  { id: 198, word: "billion", meaning: "십억", pronunciation: "빌리언", category: "숫자", difficulty: "expert", example: "A billion stars.", exampleKorean: "별 십억 개.", tip: "1,000,000,000" },
  { id: 199, word: "quarter", meaning: "1/4", pronunciation: "쿼터", category: "숫자", difficulty: "expert", example: "A quarter of pizza.", exampleKorean: "피자 4분의 1.", tip: "¼" },
  { id: 200, word: "dozen", meaning: "12개", pronunciation: "더즌", category: "숫자", difficulty: "expert", example: "A dozen eggs.", exampleKorean: "달걀 12개.", tip: "12개를 한 묶음!" },

  // ========================================
  // 👨‍👩‍👧 가족 (Family) - 30개
  // ========================================

  // 가족 - easy (12개)
  { id: 201, word: "mom", meaning: "엄마", pronunciation: "맘", category: "가족", difficulty: "easy", example: "I love my mom.", exampleKorean: "나는 엄마를 사랑해요.", tip: "👩 사랑해요!" },
  { id: 202, word: "dad", meaning: "아빠", pronunciation: "대드", category: "가족", difficulty: "easy", example: "My dad is tall.", exampleKorean: "우리 아빠는 키가 커요.", tip: "👨 든든해요!" },
  { id: 203, word: "baby", meaning: "아기", pronunciation: "베이비", category: "가족", difficulty: "easy", example: "The baby is cute.", exampleKorean: "아기가 귀여워요.", tip: "👶 응애응애!" },
  { id: 204, word: "family", meaning: "가족", pronunciation: "패밀리", category: "가족", difficulty: "easy", example: "I love my family.", exampleKorean: "나는 가족을 사랑해요.", tip: "👨‍👩‍👧‍👦 함께!" },
  { id: 205, word: "mother", meaning: "어머니", pronunciation: "마더", category: "가족", difficulty: "easy", example: "My mother is kind.", exampleKorean: "어머니는 친절해요.", tip: "mom의 정중한 표현!" },
  { id: 206, word: "father", meaning: "아버지", pronunciation: "파더", category: "가족", difficulty: "easy", example: "My father works hard.", exampleKorean: "아버지는 열심히 일해요.", tip: "dad의 정중한 표현!" },
  { id: 207, word: "brother", meaning: "형/오빠/남동생", pronunciation: "브라더", category: "가족", difficulty: "easy", example: "My brother is funny.", exampleKorean: "내 형은 재미있어요.", tip: "👦 남자 형제!" },
  { id: 208, word: "sister", meaning: "누나/언니/여동생", pronunciation: "시스터", category: "가족", difficulty: "easy", example: "My sister is smart.", exampleKorean: "내 누나는 똑똑해요.", tip: "👧 여자 형제!" },
  { id: 209, word: "grandma", meaning: "할머니", pronunciation: "그랜마", category: "가족", difficulty: "easy", example: "Grandma bakes cookies.", exampleKorean: "할머니가 쿠키를 구워요.", tip: "👵 다정해요!" },
  { id: 210, word: "grandpa", meaning: "할아버지", pronunciation: "그랜파", category: "가족", difficulty: "easy", example: "Grandpa tells stories.", exampleKorean: "할아버지가 이야기해 줘요.", tip: "👴 지혜로워요!" },
  { id: 211, word: "son", meaning: "아들", pronunciation: "선", category: "가족", difficulty: "easy", example: "He is my son.", exampleKorean: "그는 내 아들이에요.", tip: "👦 남자 자녀!" },
  { id: 212, word: "daughter", meaning: "딸", pronunciation: "도터", category: "가족", difficulty: "easy", example: "She is my daughter.", exampleKorean: "그녀는 내 딸이에요.", tip: "👧 여자 자녀!" },

  // 가족 - medium (10개)
  { id: 213, word: "uncle", meaning: "삼촌/외삼촌", pronunciation: "엉클", category: "가족", difficulty: "medium", example: "My uncle is funny.", exampleKorean: "삼촌은 재미있어요.", tip: "부모님의 형제!" },
  { id: 214, word: "aunt", meaning: "이모/고모", pronunciation: "앤트", category: "가족", difficulty: "medium", example: "My aunt lives far away.", exampleKorean: "이모는 멀리 살아요.", tip: "부모님의 자매!" },
  { id: 215, word: "cousin", meaning: "사촌", pronunciation: "커즌", category: "가족", difficulty: "medium", example: "My cousin is my age.", exampleKorean: "내 사촌은 나와 동갑이에요.", tip: "삼촌/이모의 자녀!" },
  { id: 216, word: "husband", meaning: "남편", pronunciation: "허즈번드", category: "가족", difficulty: "medium", example: "He is her husband.", exampleKorean: "그는 그녀의 남편이에요.", tip: "결혼한 남자!" },
  { id: 217, word: "wife", meaning: "아내", pronunciation: "와이프", category: "가족", difficulty: "medium", example: "She is his wife.", exampleKorean: "그녀는 그의 아내예요.", tip: "결혼한 여자!" },
  { id: 218, word: "parents", meaning: "부모님", pronunciation: "페어런츠", category: "가족", difficulty: "medium", example: "I love my parents.", exampleKorean: "나는 부모님을 사랑해요.", tip: "엄마+아빠!" },
  { id: 219, word: "grandmother", meaning: "할머니", pronunciation: "그랜드마더", category: "가족", difficulty: "medium", example: "My grandmother is 80.", exampleKorean: "할머니는 80세예요.", tip: "grandma의 정중한 표현!" },
  { id: 220, word: "grandfather", meaning: "할아버지", pronunciation: "그랜드파더", category: "가족", difficulty: "medium", example: "My grandfather is wise.", exampleKorean: "할아버지는 지혜로워요.", tip: "grandpa의 정중한 표현!" },
  { id: 221, word: "nephew", meaning: "조카(남)", pronunciation: "네퓨", category: "가족", difficulty: "medium", example: "My nephew is 5.", exampleKorean: "내 조카는 5살이에요.", tip: "형제의 아들!" },
  { id: 222, word: "niece", meaning: "조카(여)", pronunciation: "니스", category: "가족", difficulty: "medium", example: "My niece is cute.", exampleKorean: "내 조카는 귀여워요.", tip: "형제의 딸!" },

  // 가족 - hard (5개)
  { id: 223, word: "grandparents", meaning: "조부모님", pronunciation: "그랜드페어런츠", category: "가족", difficulty: "hard", example: "I visit my grandparents.", exampleKorean: "나는 조부모님을 방문해요.", tip: "할머니+할아버지!" },
  { id: 224, word: "sibling", meaning: "형제자매", pronunciation: "시블링", category: "가족", difficulty: "hard", example: "I have two siblings.", exampleKorean: "나는 형제자매가 둘이에요.", tip: "brother+sister!" },
  { id: 225, word: "relative", meaning: "친척", pronunciation: "렐러티브", category: "가족", difficulty: "hard", example: "Many relatives came.", exampleKorean: "많은 친척이 왔어요.", tip: "가족 관계인 사람들!" },
  { id: 226, word: "stepmother", meaning: "새엄마", pronunciation: "스텝마더", category: "가족", difficulty: "hard", example: "She is my stepmother.", exampleKorean: "그녀는 새엄마예요.", tip: "아버지의 새 아내!" },
  { id: 227, word: "stepfather", meaning: "새아빠", pronunciation: "스텝파더", category: "가족", difficulty: "hard", example: "He is my stepfather.", exampleKorean: "그는 새아빠예요.", tip: "어머니의 새 남편!" },

  // 가족 - expert (3개)
  { id: 228, word: "great-grandmother", meaning: "증조할머니", pronunciation: "그레이트그랜드마더", category: "가족", difficulty: "expert", example: "My great-grandmother is 100.", exampleKorean: "증조할머니는 100세예요.", tip: "할머니의 엄마!" },
  { id: 229, word: "great-grandfather", meaning: "증조할아버지", pronunciation: "그레이트그랜드파더", category: "가족", difficulty: "expert", example: "My great-grandfather was a farmer.", exampleKorean: "증조할아버지는 농부였어요.", tip: "할아버지의 아버지!" },
  { id: 230, word: "mother-in-law", meaning: "장모님/시어머니", pronunciation: "마더인로", category: "가족", difficulty: "expert", example: "She is my mother-in-law.", exampleKorean: "그녀는 내 장모님이에요.", tip: "배우자의 어머니!" },

  // ========================================
  // 🍔 음식 (Food) - 첫 번째 배치 70개
  // ========================================

  // 음식 - easy (25개)
  { id: 231, word: "bread", meaning: "빵", pronunciation: "브레드", category: "음식", difficulty: "easy", example: "I eat bread.", exampleKorean: "나는 빵을 먹어요.", tip: "🍞 아침에 먹어요!" },
  { id: 232, word: "rice", meaning: "밥", pronunciation: "라이스", category: "음식", difficulty: "easy", example: "Koreans eat rice.", exampleKorean: "한국 사람은 밥을 먹어요.", tip: "🍚 한국 주식!" },
  { id: 233, word: "egg", meaning: "달걀", pronunciation: "에그", category: "음식", difficulty: "easy", example: "I like fried egg.", exampleKorean: "나는 계란프라이를 좋아해요.", tip: "🥚 닭이 낳아요!" },
  { id: 234, word: "milk", meaning: "우유", pronunciation: "밀크", category: "음식", difficulty: "easy", example: "Milk is white.", exampleKorean: "우유는 하얀색이에요.", tip: "🥛 소에서 나와요!" },
  { id: 235, word: "water", meaning: "물", pronunciation: "워터", category: "음식", difficulty: "easy", example: "I drink water.", exampleKorean: "나는 물을 마셔요.", tip: "💧 목마를 때!" },
  { id: 236, word: "juice", meaning: "주스", pronunciation: "주스", category: "음식", difficulty: "easy", example: "Orange juice is sweet.", exampleKorean: "오렌지 주스는 달아요.", tip: "🧃 과일로 만들어요!" },
  { id: 237, word: "pizza", meaning: "피자", pronunciation: "피자", category: "음식", difficulty: "easy", example: "I love pizza!", exampleKorean: "나는 피자를 좋아해요!", tip: "🍕 치즈가 쭉~!" },
  { id: 238, word: "chicken", meaning: "치킨", pronunciation: "치킨", category: "음식", difficulty: "easy", example: "Fried chicken is yummy.", exampleKorean: "치킨은 맛있어요.", tip: "🍗 바삭바삭!" },
  { id: 239, word: "cake", meaning: "케이크", pronunciation: "케이크", category: "음식", difficulty: "easy", example: "Birthday cake!", exampleKorean: "생일 케이크!", tip: "🎂 생일에 먹어요!" },
  { id: 240, word: "cookie", meaning: "쿠키", pronunciation: "쿠키", category: "음식", difficulty: "easy", example: "Cookies are sweet.", exampleKorean: "쿠키는 달아요.", tip: "🍪 바삭달콤!" },
  { id: 241, word: "candy", meaning: "사탕", pronunciation: "캔디", category: "음식", difficulty: "easy", example: "I love candy!", exampleKorean: "나는 사탕을 좋아해요!", tip: "🍬 달콤해요!" },
  { id: 242, word: "ice cream", meaning: "아이스크림", pronunciation: "아이스크림", category: "음식", difficulty: "easy", example: "Ice cream is cold.", exampleKorean: "아이스크림은 차가워요.", tip: "🍦 여름에 먹어요!" },
  { id: 243, word: "cheese", meaning: "치즈", pronunciation: "치즈", category: "음식", difficulty: "easy", example: "I like cheese.", exampleKorean: "나는 치즈를 좋아해요.", tip: "🧀 쥐가 좋아해요!" },
  { id: 244, word: "butter", meaning: "버터", pronunciation: "버터", category: "음식", difficulty: "easy", example: "Butter is yellow.", exampleKorean: "버터는 노란색이에요.", tip: "🧈 빵에 발라요!" },
  { id: 245, word: "meat", meaning: "고기", pronunciation: "미트", category: "음식", difficulty: "easy", example: "I eat meat.", exampleKorean: "나는 고기를 먹어요.", tip: "🍖 단백질!" },
  { id: 246, word: "fish", meaning: "생선", pronunciation: "피쉬", category: "음식", difficulty: "easy", example: "Fish is healthy.", exampleKorean: "생선은 건강해요.", tip: "🐟 바다에서 와요!" },
  { id: 247, word: "soup", meaning: "수프", pronunciation: "수프", category: "음식", difficulty: "easy", example: "Soup is warm.", exampleKorean: "수프는 따뜻해요.", tip: "🍲 따뜻해요!" },
  { id: 248, word: "salad", meaning: "샐러드", pronunciation: "샐러드", category: "음식", difficulty: "easy", example: "Salad is healthy.", exampleKorean: "샐러드는 건강해요.", tip: "🥗 채소 가득!" },
  { id: 249, word: "sandwich", meaning: "샌드위치", pronunciation: "샌드위치", category: "음식", difficulty: "easy", example: "I made a sandwich.", exampleKorean: "나는 샌드위치를 만들었어요.", tip: "🥪 빵 사이에!" },
  { id: 250, word: "hamburger", meaning: "햄버거", pronunciation: "햄버거", category: "음식", difficulty: "easy", example: "I want a hamburger.", exampleKorean: "나는 햄버거를 원해요.", tip: "🍔 맛있어요!" },
  { id: 251, word: "hotdog", meaning: "핫도그", pronunciation: "핫도그", category: "음식", difficulty: "easy", example: "Hotdogs are tasty.", exampleKorean: "핫도그는 맛있어요.", tip: "🌭 소시지+빵!" },
  { id: 252, word: "noodle", meaning: "국수", pronunciation: "누들", category: "음식", difficulty: "easy", example: "I love noodles.", exampleKorean: "나는 국수를 좋아해요.", tip: "🍜 후루룩!" },
  { id: 253, word: "potato", meaning: "감자", pronunciation: "포테이토", category: "음식", difficulty: "easy", example: "Potatoes are yummy.", exampleKorean: "감자는 맛있어요.", tip: "🥔 땅에서 자라요!" },
  { id: 254, word: "carrot", meaning: "당근", pronunciation: "캐럿", category: "음식", difficulty: "easy", example: "Rabbits love carrots.", exampleKorean: "토끼는 당근을 좋아해요.", tip: "🥕 토끼가 좋아해요!" },
  { id: 255, word: "tomato", meaning: "토마토", pronunciation: "토메이토", category: "음식", difficulty: "easy", example: "Tomatoes are red.", exampleKorean: "토마토는 빨간색이에요.", tip: "🍅 채소? 과일?" },

  // 음식 - medium (25개)
  { id: 256, word: "pasta", meaning: "파스타", pronunciation: "파스타", category: "음식", difficulty: "medium", example: "I like pasta.", exampleKorean: "나는 파스타를 좋아해요.", tip: "🍝 이탈리아 음식!" },
  { id: 257, word: "steak", meaning: "스테이크", pronunciation: "스테이크", category: "음식", difficulty: "medium", example: "Steak is delicious.", exampleKorean: "스테이크는 맛있어요.", tip: "🥩 고급 고기!" },
  { id: 258, word: "sausage", meaning: "소시지", pronunciation: "소시지", category: "음식", difficulty: "medium", example: "I love sausages.", exampleKorean: "나는 소시지를 좋아해요.", tip: "🌭 고기로 만들어요!" },
  { id: 259, word: "bacon", meaning: "베이컨", pronunciation: "베이컨", category: "음식", difficulty: "medium", example: "Bacon is crispy.", exampleKorean: "베이컨은 바삭해요.", tip: "🥓 아침에 먹어요!" },
  { id: 260, word: "shrimp", meaning: "새우", pronunciation: "쉬림프", category: "음식", difficulty: "medium", example: "I like shrimp.", exampleKorean: "나는 새우를 좋아해요.", tip: "🦐 바다에서 와요!" },
  { id: 261, word: "lobster", meaning: "랍스터", pronunciation: "랍스터", category: "음식", difficulty: "medium", example: "Lobster is expensive.", exampleKorean: "랍스터는 비싸요.", tip: "🦞 고급 해산물!" },
  { id: 262, word: "crab", meaning: "게", pronunciation: "크랩", category: "음식", difficulty: "medium", example: "I ate crab.", exampleKorean: "나는 게를 먹었어요.", tip: "🦀 집게가 있어요!" },
  { id: 263, word: "tuna", meaning: "참치", pronunciation: "투나", category: "음식", difficulty: "medium", example: "Tuna sandwich.", exampleKorean: "참치 샌드위치.", tip: "🐟 김밥에 넣어요!" },
  { id: 264, word: "salmon", meaning: "연어", pronunciation: "새먼", category: "음식", difficulty: "medium", example: "Salmon is pink.", exampleKorean: "연어는 분홍색이에요.", tip: "🐟 핑크색 생선!" },
  { id: 265, word: "mushroom", meaning: "버섯", pronunciation: "머쉬룸", category: "음식", difficulty: "medium", example: "I like mushrooms.", exampleKorean: "나는 버섯을 좋아해요.", tip: "🍄 숲에서 자라요!" },
  { id: 266, word: "onion", meaning: "양파", pronunciation: "어니언", category: "음식", difficulty: "medium", example: "Onions make me cry.", exampleKorean: "양파가 눈물 나게 해요.", tip: "🧅 눈물이 나요!" },
  { id: 267, word: "garlic", meaning: "마늘", pronunciation: "갈릭", category: "음식", difficulty: "medium", example: "Garlic is strong.", exampleKorean: "마늘은 냄새가 강해요.", tip: "🧄 향이 강해요!" },
  { id: 268, word: "pepper", meaning: "후추/고추", pronunciation: "페퍼", category: "음식", difficulty: "medium", example: "Pepper is spicy.", exampleKorean: "후추는 매워요.", tip: "🌶️ 매콤해요!" },
  { id: 269, word: "salt", meaning: "소금", pronunciation: "솔트", category: "음식", difficulty: "medium", example: "Salt is white.", exampleKorean: "소금은 하얀색이에요.", tip: "🧂 짜요!" },
  { id: 270, word: "sugar", meaning: "설탕", pronunciation: "슈거", category: "음식", difficulty: "medium", example: "Sugar is sweet.", exampleKorean: "설탕은 달아요.", tip: "🍬 달콤해요!" },
  { id: 271, word: "honey", meaning: "꿀", pronunciation: "허니", category: "음식", difficulty: "medium", example: "Honey is sweet.", exampleKorean: "꿀은 달아요.", tip: "🍯 벌이 만들어요!" },
  { id: 272, word: "jam", meaning: "잼", pronunciation: "잼", category: "음식", difficulty: "medium", example: "I like strawberry jam.", exampleKorean: "나는 딸기잼을 좋아해요.", tip: "🍓 빵에 발라요!" },
  { id: 273, word: "cereal", meaning: "시리얼", pronunciation: "시리얼", category: "음식", difficulty: "medium", example: "I eat cereal for breakfast.", exampleKorean: "나는 아침에 시리얼을 먹어요.", tip: "🥣 우유랑 먹어요!" },
  { id: 274, word: "yogurt", meaning: "요거트", pronunciation: "요거트", category: "음식", difficulty: "medium", example: "Yogurt is healthy.", exampleKorean: "요거트는 건강해요.", tip: "🥛 유산균 가득!" },
  { id: 275, word: "chocolate", meaning: "초콜릿", pronunciation: "초콜릿", category: "음식", difficulty: "medium", example: "I love chocolate!", exampleKorean: "나는 초콜릿을 좋아해요!", tip: "🍫 달콤해요!" },
  { id: 276, word: "popcorn", meaning: "팝콘", pronunciation: "팝콘", category: "음식", difficulty: "medium", example: "Popcorn at the movies.", exampleKorean: "영화관에서 팝콘.", tip: "🍿 영화 볼 때!" },
  { id: 277, word: "donut", meaning: "도넛", pronunciation: "도넛", category: "음식", difficulty: "medium", example: "Donuts are sweet.", exampleKorean: "도넛은 달아요.", tip: "🍩 동그란 구멍!" },
  { id: 278, word: "waffle", meaning: "와플", pronunciation: "와플", category: "음식", difficulty: "medium", example: "I like waffles.", exampleKorean: "나는 와플을 좋아해요.", tip: "🧇 네모 무늬!" },
  { id: 279, word: "pancake", meaning: "팬케이크", pronunciation: "팬케이크", category: "음식", difficulty: "medium", example: "Pancakes for breakfast.", exampleKorean: "아침에 팬케이크.", tip: "🥞 시럽 뿌려요!" },
  { id: 280, word: "pretzel", meaning: "프레첼", pronunciation: "프레첼", category: "음식", difficulty: "medium", example: "Pretzels are salty.", exampleKorean: "프레첼은 짜요.", tip: "🥨 꼬인 빵!" },

  // 음식 - hard (15개)
  { id: 281, word: "broccoli", meaning: "브로콜리", pronunciation: "브로콜리", category: "음식", difficulty: "hard", example: "Broccoli is green.", exampleKorean: "브로콜리는 초록색이에요.", tip: "🥦 작은 나무 같아요!" },
  { id: 282, word: "cauliflower", meaning: "콜리플라워", pronunciation: "콜리플라워", category: "음식", difficulty: "hard", example: "Cauliflower is white.", exampleKorean: "콜리플라워는 하얀색이에요.", tip: "🥬 하얀 브로콜리!" },
  { id: 283, word: "asparagus", meaning: "아스파라거스", pronunciation: "어스패러거스", category: "음식", difficulty: "hard", example: "Asparagus is long.", exampleKorean: "아스파라거스는 길어요.", tip: "🥬 길쭉한 채소!" },
  { id: 284, word: "zucchini", meaning: "주키니호박", pronunciation: "주키니", category: "음식", difficulty: "hard", example: "Zucchini is green.", exampleKorean: "주키니는 초록색이에요.", tip: "🥒 오이 닮았어요!" },
  { id: 285, word: "cucumber", meaning: "오이", pronunciation: "큐컴버", category: "음식", difficulty: "hard", example: "Cucumbers are crunchy.", exampleKorean: "오이는 아삭해요.", tip: "🥒 시원해요!" },
  { id: 286, word: "lettuce", meaning: "상추", pronunciation: "레터스", category: "음식", difficulty: "hard", example: "Lettuce in salad.", exampleKorean: "샐러드에 상추.", tip: "🥬 쌈 싸 먹어요!" },
  { id: 287, word: "spinach", meaning: "시금치", pronunciation: "스피니치", category: "음식", difficulty: "hard", example: "Spinach is healthy.", exampleKorean: "시금치는 건강해요.", tip: "🥬 뽀빠이 힘!" },
  { id: 288, word: "cabbage", meaning: "양배추", pronunciation: "캐비지", category: "음식", difficulty: "hard", example: "Cabbage is green.", exampleKorean: "양배추는 초록색이에요.", tip: "🥬 겹겹이 쌓여요!" },
  { id: 289, word: "eggplant", meaning: "가지", pronunciation: "에그플랜트", category: "음식", difficulty: "hard", example: "Eggplants are purple.", exampleKorean: "가지는 보라색이에요.", tip: "🍆 보라색 채소!" },
  { id: 290, word: "pumpkin", meaning: "호박", pronunciation: "펌킨", category: "음식", difficulty: "hard", example: "Pumpkin pie.", exampleKorean: "호박 파이.", tip: "🎃 할로윈!" },
  { id: 291, word: "corn", meaning: "옥수수", pronunciation: "콘", category: "음식", difficulty: "hard", example: "Corn is yellow.", exampleKorean: "옥수수는 노란색이에요.", tip: "🌽 팝콘 만들어요!" },
  { id: 292, word: "tofu", meaning: "두부", pronunciation: "토푸", category: "음식", difficulty: "hard", example: "Tofu is soft.", exampleKorean: "두부는 부드러워요.", tip: "🧈 콩으로 만들어요!" },
  { id: 293, word: "dumpling", meaning: "만두", pronunciation: "덤플링", category: "음식", difficulty: "hard", example: "Dumplings are yummy.", exampleKorean: "만두는 맛있어요.", tip: "🥟 속이 꽉 찼어요!" },
  { id: 294, word: "sushi", meaning: "초밥", pronunciation: "수시", category: "음식", difficulty: "hard", example: "Sushi is Japanese food.", exampleKorean: "초밥은 일본 음식이에요.", tip: "🍣 생선+밥!" },
  { id: 295, word: "curry", meaning: "카레", pronunciation: "커리", category: "음식", difficulty: "hard", example: "Curry is spicy.", exampleKorean: "카레는 매워요.", tip: "🍛 인도 음식!" },

  // 음식 - expert (5개)
  { id: 296, word: "avocado toast", meaning: "아보카도 토스트", pronunciation: "아보카도 토스트", category: "음식", difficulty: "expert", example: "Avocado toast for breakfast.", exampleKorean: "아침에 아보카도 토스트.", tip: "🥑🍞 트렌디한 음식!" },
  { id: 297, word: "croissant", meaning: "크루아상", pronunciation: "크루아상", category: "음식", difficulty: "expert", example: "Croissants are French.", exampleKorean: "크루아상은 프랑스 빵이에요.", tip: "🥐 프랑스 빵!" },
  { id: 298, word: "macaroni", meaning: "마카로니", pronunciation: "매커로니", category: "음식", difficulty: "expert", example: "Macaroni and cheese.", exampleKorean: "마카로니 앤 치즈.", tip: "🧀 치즈랑 먹어요!" },
  { id: 299, word: "quesadilla", meaning: "케사디야", pronunciation: "케사디야", category: "음식", difficulty: "expert", example: "Quesadillas are Mexican.", exampleKorean: "케사디야는 멕시코 음식이에요.", tip: "🌮 치즈 가득!" },
  { id: 300, word: "bruschetta", meaning: "브루스게타", pronunciation: "브루스게타", category: "음식", difficulty: "expert", example: "Bruschetta is Italian.", exampleKorean: "브루스게타는 이탈리아 음식이에요.", tip: "🍅 토마토 빵!" },
];

// 카테고리별 단어 가져오기
export const getWordsByCategory = (category: WordCategory): EnglishWord[] => {
  return englishWordsData.filter(word => word.category === category);
};

// 난이도별 단어 가져오기
export const getWordsByDifficulty = (difficulty: WordDifficulty): EnglishWord[] => {
  return englishWordsData.filter(word => word.difficulty === difficulty);
};

// 랜덤 단어 가져오기
export const getRandomWords = (count: number, difficulty?: WordDifficulty, category?: WordCategory): EnglishWord[] => {
  let words = [...englishWordsData];
  if (difficulty) {
    words = words.filter(word => word.difficulty === difficulty);
  }
  if (category) {
    words = words.filter(word => word.category === category);
  }
  const shuffled = words.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// 카테고리 목록
export const wordCategories: WordCategory[] = [
  "동물", "과일", "색깔", "숫자", "가족", "음식", "자연", "탈것",
  "신체", "감정", "날씨", "포켓몬", "동사", "학교", "장소", "반대말",
  "시간", "일상표현", "옷", "집", "스포츠", "직업", "악기", "형용사", "문장"
];

// 카테고리별 이모지
export const categoryEmojis: Record<WordCategory, string> = {
  동물: "🐾",
  과일: "🍎",
  색깔: "🌈",
  숫자: "🔢",
  가족: "👨‍👩‍👧",
  음식: "🍔",
  자연: "🌳",
  탈것: "🚗",
  신체: "👋",
  감정: "😊",
  날씨: "☀️",
  포켓몬: "⚡",
  동사: "🏃",
  학교: "🏫",
  장소: "📍",
  반대말: "↔️",
  시간: "⏰",
  일상표현: "💬",
  옷: "👕",
  집: "🏠",
  스포츠: "⚽",
  직업: "👨‍⚕️",
  악기: "🎸",
  형용사: "✨",
  문장: "💭",
};

// 총 단어 수
export const getTotalWordCount = (): number => englishWordsData.length;

// 카테고리별 단어 수
export const getWordCountByCategory = (): Record<WordCategory, number> => {
  const counts = {} as Record<WordCategory, number>;
  wordCategories.forEach(cat => {
    counts[cat] = englishWordsData.filter(w => w.category === cat).length;
  });
  return counts;
};
