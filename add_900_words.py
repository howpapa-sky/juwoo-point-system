#!/usr/bin/env python3
"""
900개 영어 단어를 Supabase에 추가하는 스크립트
난이도: easy 250개, medium 400개, hard 250개
카테고리: Education, Career, Emotions, Health, Sports, Technology, Nature, Travel, Hobbies, Music, Art, Science (각 60개씩, 총 720개)
+ History, Politics, Economy (각 60개씩, 총 180개)
"""

import os
from supabase import create_client, Client

# Supabase 설정
SUPABASE_URL = "https://wgpkfbgdqkxsqpxsxjbh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncGtmYmdkcWt4c3FweHN4amJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNDg4NjMsImV4cCI6MjA0NzcyNDg2M30.QVpyp7qZfqQAI0RjqJaE_2RwBqfJBYCDqhbKUdBXXA4"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 900개 단어 데이터 (12개 카테고리 × 60개 + 추가 3개 카테고리 × 60개)
words_data = []

# Education (60개 - easy 20, medium 25, hard 15)
education_words = [
    # Easy (20개)
    ('student', '학생', 'easy'), ('teacher', '선생님', 'easy'), ('school', '학교', 'easy'),
    ('book', '책', 'easy'), ('pencil', '연필', 'easy'), ('desk', '책상', 'easy'),
    ('classroom', '교실', 'easy'), ('homework', '숙제', 'easy'), ('test', '시험', 'easy'),
    ('grade', '성적', 'easy'), ('lesson', '수업', 'easy'), ('study', '공부하다', 'easy'),
    ('learn', '배우다', 'easy'), ('read', '읽다', 'easy'), ('write', '쓰다', 'easy'),
    ('library', '도서관', 'easy'), ('notebook', '공책', 'easy'), ('eraser', '지우개', 'easy'),
    ('ruler', '자', 'easy'), ('backpack', '가방', 'easy'),
    
    # Medium (25개)
    ('university', '대학교', 'medium'), ('professor', '교수', 'medium'), ('lecture', '강의', 'medium'),
    ('semester', '학기', 'medium'), ('curriculum', '교육과정', 'medium'), ('assignment', '과제', 'medium'),
    ('research', '연구', 'medium'), ('scholarship', '장학금', 'medium'), ('diploma', '졸업장', 'medium'),
    ('tuition', '등록금', 'medium'), ('campus', '캠퍼스', 'medium'), ('major', '전공', 'medium'),
    ('minor', '부전공', 'medium'), ('degree', '학위', 'medium'), ('graduate', '졸업하다', 'medium'),
    ('enroll', '등록하다', 'medium'), ('attendance', '출석', 'medium'), ('syllabus', '강의계획서', 'medium'),
    ('textbook', '교과서', 'medium'), ('laboratory', '실험실', 'medium'), ('examination', '시험', 'medium'),
    ('certificate', '증명서', 'medium'), ('academic', '학문의', 'medium'), ('discipline', '학문분야', 'medium'),
    ('comprehension', '이해', 'medium'),
    
    # Hard (15개)
    ('pedagogy', '교육학', 'hard'), ('dissertation', '논문', 'hard'), ('accreditation', '인증', 'hard'),
    ('matriculation', '입학', 'hard'), ('epistemology', '인식론', 'hard'), ('heuristic', '발견적', 'hard'),
    ('empirical', '경험적인', 'hard'), ('methodology', '방법론', 'hard'), ('theoretical', '이론적인', 'hard'),
    ('hypothesis', '가설', 'hard'), ('plagiarism', '표절', 'hard'), ('symposium', '심포지엄', 'hard'),
    ('tenure', '종신재직권', 'hard'), ('prerequisite', '선수과목', 'hard'), ('cognition', '인지', 'hard'),
]

for word, korean, diff in education_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Education', 'difficulty': diff})

# Career (60개)
career_words = [
    # Easy (20개)
    ('job', '직업', 'easy'), ('work', '일', 'easy'), ('office', '사무실', 'easy'),
    ('boss', '상사', 'easy'), ('employee', '직원', 'easy'), ('salary', '급여', 'easy'),
    ('meeting', '회의', 'easy'), ('project', '프로젝트', 'easy'), ('team', '팀', 'easy'),
    ('manager', '관리자', 'easy'), ('company', '회사', 'easy'), ('business', '사업', 'easy'),
    ('customer', '고객', 'easy'), ('service', '서비스', 'easy'), ('product', '제품', 'easy'),
    ('schedule', '일정', 'easy'), ('deadline', '마감일', 'easy'), ('email', '이메일', 'easy'),
    ('report', '보고서', 'easy'), ('presentation', '발표', 'easy'),
    
    # Medium (25개)
    ('entrepreneur', '기업가', 'medium'), ('corporation', '기업', 'medium'), ('department', '부서', 'medium'),
    ('colleague', '동료', 'medium'), ('promotion', '승진', 'medium'), ('contract', '계약', 'medium'),
    ('negotiation', '협상', 'medium'), ('strategy', '전략', 'medium'), ('revenue', '수익', 'medium'),
    ('profit', '이익', 'medium'), ('investment', '투자', 'medium'), ('marketing', '마케팅', 'medium'),
    ('advertising', '광고', 'medium'), ('budget', '예산', 'medium'), ('expense', '비용', 'medium'),
    ('productivity', '생산성', 'medium'), ('efficiency', '효율성', 'medium'), ('performance', '성과', 'medium'),
    ('evaluation', '평가', 'medium'), ('compensation', '보상', 'medium'), ('benefits', '복리후생', 'medium'),
    ('recruitment', '채용', 'medium'), ('resignation', '사직', 'medium'), ('retirement', '은퇴', 'medium'),
    ('freelance', '프리랜서', 'medium'),
    
    # Hard (15개)
    ('entrepreneurship', '기업가정신', 'hard'), ('stakeholder', '이해관계자', 'hard'), ('merger', '합병', 'hard'),
    ('acquisition', '인수', 'hard'), ('subsidiary', '자회사', 'hard'), ('diversification', '다각화', 'hard'),
    ('synergy', '시너지', 'hard'), ('leverage', '레버리지', 'hard'), ('arbitration', '중재', 'hard'),
    ('compliance', '준수', 'hard'), ('liability', '책임', 'hard'), ('confidentiality', '기밀성', 'hard'),
    ('severance', '퇴직금', 'hard'), ('fiduciary', '수탁자', 'hard'), ('remuneration', '보수', 'hard'),
]

for word, korean, diff in career_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Career', 'difficulty': diff})

# Emotions (60개)
emotions_words = [
    # Easy (20개)
    ('happy', '행복한', 'easy'), ('sad', '슬픈', 'easy'), ('angry', '화난', 'easy'),
    ('scared', '무서운', 'easy'), ('excited', '신난', 'easy'), ('tired', '피곤한', 'easy'),
    ('bored', '지루한', 'easy'), ('surprised', '놀란', 'easy'), ('worried', '걱정되는', 'easy'),
    ('nervous', '긴장한', 'easy'), ('proud', '자랑스러운', 'easy'), ('shy', '수줍은', 'easy'),
    ('lonely', '외로운', 'easy'), ('confused', '혼란스러운', 'easy'), ('calm', '차분한', 'easy'),
    ('relaxed', '편안한', 'easy'), ('cheerful', '명랑한', 'easy'), ('grateful', '감사한', 'easy'),
    ('jealous', '질투하는', 'easy'), ('disappointed', '실망한', 'easy'),
    
    # Medium (25개)
    ('anxious', '불안한', 'medium'), ('frustrated', '좌절한', 'medium'), ('overwhelmed', '압도된', 'medium'),
    ('enthusiastic', '열정적인', 'medium'), ('optimistic', '낙관적인', 'medium'), ('pessimistic', '비관적인', 'medium'),
    ('nostalgic', '향수에 젖은', 'medium'), ('embarrassed', '당황한', 'medium'), ('ashamed', '부끄러운', 'medium'),
    ('guilty', '죄책감 드는', 'medium'), ('resentful', '분개한', 'medium'), ('indifferent', '무관심한', 'medium'),
    ('sympathetic', '동정적인', 'medium'), ('empathetic', '공감하는', 'medium'), ('compassionate', '자비로운', 'medium'),
    ('content', '만족한', 'medium'), ('ecstatic', '황홀한', 'medium'), ('melancholy', '우울한', 'medium'),
    ('irritated', '짜증난', 'medium'), ('agitated', '동요된', 'medium'), ('serene', '평온한', 'medium'),
    ('delighted', '기쁜', 'medium'), ('dismayed', '낙담한', 'medium'), ('apprehensive', '걱정하는', 'medium'),
    ('exhilarated', '들뜬', 'medium'),
    
    # Hard (15개)
    ('euphoric', '도취된', 'hard'), ('despondent', '낙담한', 'hard'), ('indignant', '분개한', 'hard'),
    ('ambivalent', '양가감정의', 'hard'), ('complacent', '자기만족의', 'hard'), ('contemptuous', '경멸하는', 'hard'),
    ('vindictive', '복수심 강한', 'hard'), ('remorseful', '후회하는', 'hard'), ('wistful', '그리워하는', 'hard'),
    ('jubilant', '환희에 찬', 'hard'), ('morose', '시무룩한', 'hard'), ('petulant', '성마른', 'hard'),
    ('sanguine', '낙천적인', 'hard'), ('stoic', '금욕적인', 'hard'), ('vexed', '괴로워하는', 'hard'),
]

for word, korean, diff in emotions_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Emotions', 'difficulty': diff})

# Health (60개)
health_words = [
    # Easy (20개)
    ('doctor', '의사', 'easy'), ('nurse', '간호사', 'easy'), ('hospital', '병원', 'easy'),
    ('medicine', '약', 'easy'), ('sick', '아픈', 'easy'), ('pain', '통증', 'easy'),
    ('fever', '열', 'easy'), ('cough', '기침', 'easy'), ('cold', '감기', 'easy'),
    ('headache', '두통', 'easy'), ('healthy', '건강한', 'easy'), ('exercise', '운동', 'easy'),
    ('diet', '식단', 'easy'), ('sleep', '수면', 'easy'), ('vitamin', '비타민', 'easy'),
    ('injury', '부상', 'easy'), ('bandage', '붕대', 'easy'), ('pill', '알약', 'easy'),
    ('checkup', '검진', 'easy'), ('treatment', '치료', 'easy'),
    
    # Medium (25개)
    ('physician', '내과의사', 'medium'), ('surgeon', '외과의사', 'medium'), ('diagnosis', '진단', 'medium'),
    ('symptom', '증상', 'medium'), ('prescription', '처방전', 'medium'), ('therapy', '치료법', 'medium'),
    ('rehabilitation', '재활', 'medium'), ('vaccination', '예방접종', 'medium'), ('immunity', '면역', 'medium'),
    ('infection', '감염', 'medium'), ('inflammation', '염증', 'medium'), ('chronic', '만성의', 'medium'),
    ('acute', '급성의', 'medium'), ('allergy', '알레르기', 'medium'), ('diabetes', '당뇨병', 'medium'),
    ('hypertension', '고혈압', 'medium'), ('obesity', '비만', 'medium'), ('nutrition', '영양', 'medium'),
    ('metabolism', '신진대사', 'medium'), ('cardiovascular', '심혈관의', 'medium'), ('respiratory', '호흡기의', 'medium'),
    ('digestive', '소화의', 'medium'), ('neurological', '신경학적', 'medium'), ('psychiatric', '정신과의', 'medium'),
    ('preventive', '예방의', 'medium'),
    
    # Hard (15개)
    ('epidemiology', '역학', 'hard'), ('pathology', '병리학', 'hard'), ('immunology', '면역학', 'hard'),
    ('pharmacology', '약리학', 'hard'), ('anesthesia', '마취', 'hard'), ('prognosis', '예후', 'hard'),
    ('malignant', '악성의', 'hard'), ('benign', '양성의', 'hard'), ('congenital', '선천적인', 'hard'),
    ('hereditary', '유전적인', 'hard'), ('palliative', '완화의', 'hard'), ('remission', '완화', 'hard'),
    ('metastasis', '전이', 'hard'), ('comorbidity', '동반질환', 'hard'), ('contraindication', '금기사항', 'hard'),
]

for word, korean, diff in health_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Health', 'difficulty': diff})

# Sports (60개)
sports_words = [
    # Easy (20개)
    ('ball', '공', 'easy'), ('game', '경기', 'easy'), ('player', '선수', 'easy'),
    ('coach', '코치', 'easy'), ('win', '이기다', 'easy'), ('lose', '지다', 'easy'),
    ('score', '점수', 'easy'), ('goal', '골', 'easy'), ('run', '달리다', 'easy'),
    ('jump', '뛰다', 'easy'), ('swim', '수영하다', 'easy'), ('kick', '차다', 'easy'),
    ('throw', '던지다', 'easy'), ('catch', '잡다', 'easy'), ('race', '경주', 'easy'),
    ('match', '경기', 'easy'), ('practice', '연습', 'easy'), ('champion', '챔피언', 'easy'),
    ('medal', '메달', 'easy'), ('trophy', '트로피', 'easy'),
    
    # Medium (25개)
    ('tournament', '토너먼트', 'medium'), ('championship', '선수권대회', 'medium'), ('athlete', '운동선수', 'medium'),
    ('competition', '대회', 'medium'), ('opponent', '상대', 'medium'), ('referee', '심판', 'medium'),
    ('spectator', '관중', 'medium'), ('stadium', '경기장', 'medium'), ('training', '훈련', 'medium'),
    ('strategy', '전략', 'medium'), ('defense', '수비', 'medium'), ('offense', '공격', 'medium'),
    ('penalty', '페널티', 'medium'), ('overtime', '연장전', 'medium'), ('knockout', '녹아웃', 'medium'),
    ('endurance', '지구력', 'medium'), ('agility', '민첩성', 'medium'), ('stamina', '체력', 'medium'),
    ('coordination', '협응력', 'medium'), ('technique', '기술', 'medium'), ('performance', '성적', 'medium'),
    ('record', '기록', 'medium'), ('victory', '승리', 'medium'), ('defeat', '패배', 'medium'),
    ('qualifier', '예선', 'medium'),
    
    # Hard (15개)
    ('decathlon', '10종경기', 'hard'), ('triathlon', '철인3종경기', 'hard'), ('pentathlon', '5종경기', 'hard'),
    ('biomechanics', '생체역학', 'hard'), ('periodization', '주기화', 'hard'), ('plyometrics', '플라이오메트릭', 'hard'),
    ('anaerobic', '무산소의', 'hard'), ('aerobic', '유산소의', 'hard'), ('proprioception', '고유수용감각', 'hard'),
    ('kinesthesia', '운동감각', 'hard'), ('tapering', '테이퍼링', 'hard'), ('acclimatization', '순응', 'hard'),
    ('ergogenic', '운동능력향상의', 'hard'), ('lactate threshold', '젖산역치', 'hard'), ('maximal oxygen uptake', '최대산소섭취량', 'hard'),
]

for word, korean, diff in sports_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Sports', 'difficulty': diff})

# Technology (60개)
technology_words = [
    # Easy (20개)
    ('computer', '컴퓨터', 'easy'), ('phone', '전화', 'easy'), ('internet', '인터넷', 'easy'),
    ('website', '웹사이트', 'easy'), ('password', '비밀번호', 'easy'), ('keyboard', '키보드', 'easy'),
    ('mouse', '마우스', 'easy'), ('screen', '화면', 'easy'), ('camera', '카메라', 'easy'),
    ('video', '비디오', 'easy'), ('photo', '사진', 'easy'), ('app', '앱', 'easy'),
    ('download', '다운로드', 'easy'), ('upload', '업로드', 'easy'), ('wifi', '와이파이', 'easy'),
    ('battery', '배터리', 'easy'), ('charger', '충전기', 'easy'), ('printer', '프린터', 'easy'),
    ('software', '소프트웨어', 'easy'), ('hardware', '하드웨어', 'easy'),
    
    # Medium (25개)
    ('algorithm', '알고리즘', 'medium'), ('database', '데이터베이스', 'medium'), ('server', '서버', 'medium'),
    ('network', '네트워크', 'medium'), ('bandwidth', '대역폭', 'medium'), ('encryption', '암호화', 'medium'),
    ('firewall', '방화벽', 'medium'), ('malware', '악성코드', 'medium'), ('virus', '바이러스', 'medium'),
    ('backup', '백업', 'medium'), ('cloud', '클라우드', 'medium'), ('interface', '인터페이스', 'medium'),
    ('protocol', '프로토콜', 'medium'), ('router', '라우터', 'medium'), ('browser', '브라우저', 'medium'),
    ('plugin', '플러그인', 'medium'), ('cache', '캐시', 'medium'), ('cookie', '쿠키', 'medium'),
    ('debugging', '디버깅', 'medium'), ('compiler', '컴파일러', 'medium'), ('framework', '프레임워크', 'medium'),
    ('repository', '저장소', 'medium'), ('deployment', '배포', 'medium'), ('scalability', '확장성', 'medium'),
    ('latency', '지연시간', 'medium'),
    
    # Hard (15개)
    ('blockchain', '블록체인', 'hard'), ('cryptocurrency', '암호화폐', 'hard'), ('machine learning', '기계학습', 'hard'),
    ('neural network', '신경망', 'hard'), ('quantum computing', '양자컴퓨팅', 'hard'), ('virtualization', '가상화', 'hard'),
    ('containerization', '컨테이너화', 'hard'), ('microservices', '마이크로서비스', 'hard'), ('distributed system', '분산시스템', 'hard'),
    ('asynchronous', '비동기의', 'hard'), ('concurrency', '동시성', 'hard'), ('parallelism', '병렬성', 'hard'),
    ('polymorphism', '다형성', 'hard'), ('encapsulation', '캡슐화', 'hard'), ('abstraction', '추상화', 'hard'),
]

for word, korean, diff in technology_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Technology', 'difficulty': diff})

# Nature (60개)
nature_words = [
    # Easy (20개)
    ('tree', '나무', 'easy'), ('flower', '꽃', 'easy'), ('grass', '풀', 'easy'),
    ('mountain', '산', 'easy'), ('river', '강', 'easy'), ('ocean', '바다', 'easy'),
    ('lake', '호수', 'easy'), ('forest', '숲', 'easy'), ('sky', '하늘', 'easy'),
    ('cloud', '구름', 'easy'), ('sun', '태양', 'easy'), ('moon', '달', 'easy'),
    ('star', '별', 'easy'), ('rain', '비', 'easy'), ('snow', '눈', 'easy'),
    ('wind', '바람', 'easy'), ('stone', '돌', 'easy'), ('sand', '모래', 'easy'),
    ('leaf', '잎', 'easy'), ('branch', '가지', 'easy'),
    
    # Medium (25개)
    ('ecosystem', '생태계', 'medium'), ('biodiversity', '생물다양성', 'medium'), ('habitat', '서식지', 'medium'),
    ('vegetation', '식생', 'medium'), ('photosynthesis', '광합성', 'medium'), ('pollination', '수분', 'medium'),
    ('erosion', '침식', 'medium'), ('sediment', '퇴적물', 'medium'), ('mineral', '광물', 'medium'),
    ('fossil', '화석', 'medium'), ('glacier', '빙하', 'medium'), ('volcano', '화산', 'medium'),
    ('earthquake', '지진', 'medium'), ('tsunami', '쓰나미', 'medium'), ('hurricane', '허리케인', 'medium'),
    ('tornado', '토네이도', 'medium'), ('drought', '가뭄', 'medium'), ('flood', '홍수', 'medium'),
    ('climate', '기후', 'medium'), ('atmosphere', '대기', 'medium'), ('precipitation', '강수', 'medium'),
    ('humidity', '습도', 'medium'), ('temperature', '온도', 'medium'), ('altitude', '고도', 'medium'),
    ('latitude', '위도', 'medium'),
    
    # Hard (15개)
    ('geomorphology', '지형학', 'hard'), ('tectonic plates', '지각판', 'hard'), ('metamorphic', '변성의', 'hard'),
    ('igneous', '화성의', 'hard'), ('sedimentary', '퇴적의', 'hard'), ('stratosphere', '성층권', 'hard'),
    ('troposphere', '대류권', 'hard'), ('symbiosis', '공생', 'hard'), ('mutualism', '상리공생', 'hard'),
    ('parasitism', '기생', 'hard'), ('commensalism', '편리공생', 'hard'), ('succession', '천이', 'hard'),
    ('eutrophication', '부영양화', 'hard'), ('desertification', '사막화', 'hard'), ('biodegradation', '생분해', 'hard'),
]

for word, korean, diff in nature_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Nature', 'difficulty': diff})

# Travel (60개)
travel_words = [
    # Easy (20개)
    ('trip', '여행', 'easy'), ('hotel', '호텔', 'easy'), ('airport', '공항', 'easy'),
    ('plane', '비행기', 'easy'), ('train', '기차', 'easy'), ('bus', '버스', 'easy'),
    ('taxi', '택시', 'easy'), ('ticket', '표', 'easy'), ('passport', '여권', 'easy'),
    ('luggage', '짐', 'easy'), ('suitcase', '여행가방', 'easy'), ('map', '지도', 'easy'),
    ('tourist', '관광객', 'easy'), ('guide', '가이드', 'easy'), ('museum', '박물관', 'easy'),
    ('beach', '해변', 'easy'), ('restaurant', '식당', 'easy'), ('souvenir', '기념품', 'easy'),
    ('vacation', '휴가', 'easy'), ('destination', '목적지', 'easy'),
    
    # Medium (25개)
    ('itinerary', '여행일정', 'medium'), ('reservation', '예약', 'medium'), ('accommodation', '숙박', 'medium'),
    ('customs', '세관', 'medium'), ('immigration', '출입국', 'medium'), ('visa', '비자', 'medium'),
    ('currency', '통화', 'medium'), ('landmark', '명소', 'medium'), ('excursion', '소풍', 'medium'),
    ('expedition', '탐험', 'medium'), ('backpacking', '배낭여행', 'medium'), ('cruise', '크루즈', 'medium'),
    ('resort', '리조트', 'medium'), ('hostel', '호스텔', 'medium'), ('campsite', '캠핑장', 'medium'),
    ('hiking', '하이킹', 'medium'), ('sightseeing', '관광', 'medium'), ('pilgrimage', '순례', 'medium'),
    ('layover', '경유', 'medium'), ('departure', '출발', 'medium'), ('arrival', '도착', 'medium'),
    ('baggage claim', '수하물찾는곳', 'medium'), ('check-in', '체크인', 'medium'), ('check-out', '체크아웃', 'medium'),
    ('boarding', '탑승', 'medium'),
    
    # Hard (15개)
    ('ecotourism', '생태관광', 'hard'), ('expatriate', '해외거주자', 'hard'), ('nomadic', '유목의', 'hard'),
    ('cosmopolitan', '국제적인', 'hard'), ('indigenous', '토착의', 'hard'), ('vernacular', '토속의', 'hard'),
    ('diaspora', '디아스포라', 'hard'), ('repatriation', '본국송환', 'hard'), ('quarantine', '검역', 'hard'),
    ('inoculation', '예방접종', 'hard'), ('acclimatization', '적응', 'hard'), ('cartography', '지도제작', 'hard'),
    ('topography', '지형', 'hard'), ('longitude', '경도', 'hard'), ('meridian', '자오선', 'hard'),
]

for word, korean, diff in travel_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Travel', 'difficulty': diff})

# Hobbies (60개)
hobbies_words = [
    # Easy (20개)
    ('hobby', '취미', 'easy'), ('game', '게임', 'easy'), ('movie', '영화', 'easy'),
    ('music', '음악', 'easy'), ('painting', '그림', 'easy'), ('drawing', '그리기', 'easy'),
    ('cooking', '요리', 'easy'), ('baking', '베이킹', 'easy'), ('gardening', '원예', 'easy'),
    ('fishing', '낚시', 'easy'), ('camping', '캠핑', 'easy'), ('hiking', '등산', 'easy'),
    ('cycling', '자전거타기', 'easy'), ('dancing', '춤', 'easy'), ('singing', '노래', 'easy'),
    ('photography', '사진', 'easy'), ('collection', '수집', 'easy'), ('puzzle', '퍼즐', 'easy'),
    ('chess', '체스', 'easy'), ('reading', '독서', 'easy'),
    
    # Medium (25개)
    ('knitting', '뜨개질', 'medium'), ('embroidery', '자수', 'medium'), ('quilting', '퀼팅', 'medium'),
    ('pottery', '도예', 'medium'), ('sculpture', '조각', 'medium'), ('calligraphy', '서예', 'medium'),
    ('origami', '종이접기', 'medium'), ('woodworking', '목공', 'medium'), ('metalwork', '금속공예', 'medium'),
    ('scrapbooking', '스크랩북', 'medium'), ('genealogy', '가계도연구', 'medium'), ('astronomy', '천문학', 'medium'),
    ('birdwatching', '조류관찰', 'medium'), ('geocaching', '지오캐싱', 'medium'), ('archery', '양궁', 'medium'),
    ('fencing', '펜싱', 'medium'), ('meditation', '명상', 'medium'), ('yoga', '요가', 'medium'),
    ('pilates', '필라테스', 'medium'), ('volunteering', '자원봉사', 'medium'), ('blogging', '블로깅', 'medium'),
    ('vlogging', '브이로깅', 'medium'), ('podcasting', '팟캐스팅', 'medium'), ('sketching', '스케치', 'medium'),
    ('crafting', '공예', 'medium'),
    
    # Hard (15개)
    ('philately', '우표수집', 'hard'), ('numismatics', '화폐수집', 'hard'), ('horticulture', '원예학', 'hard'),
    ('viticulture', '포도재배', 'hard'), ('apiculture', '양봉', 'hard'), ('taxidermy', '박제', 'hard'),
    ('lapidary', '보석세공', 'hard'), ('enology', '포도주학', 'hard'), ('gastronomy', '미식학', 'hard'),
    ('sommelier', '소믈리에', 'hard'), ('barista', '바리스타', 'hard'), ('mixology', '칵테일제조', 'hard'),
    ('floristry', '꽃꽂이', 'hard'), ('topiary', '나무조형', 'hard'), ('bonsai', '분재', 'hard'),
]

for word, korean, diff in hobbies_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Hobbies', 'difficulty': diff})

# Music (60개)
music_words = [
    # Easy (20개)
    ('song', '노래', 'easy'), ('sing', '노래하다', 'easy'), ('listen', '듣다', 'easy'),
    ('piano', '피아노', 'easy'), ('guitar', '기타', 'easy'), ('drum', '드럼', 'easy'),
    ('violin', '바이올린', 'easy'), ('flute', '플루트', 'easy'), ('trumpet', '트럼펫', 'easy'),
    ('singer', '가수', 'easy'), ('band', '밴드', 'easy'), ('concert', '콘서트', 'easy'),
    ('melody', '멜로디', 'easy'), ('rhythm', '리듬', 'easy'), ('beat', '박자', 'easy'),
    ('note', '음표', 'easy'), ('loud', '큰소리', 'easy'), ('quiet', '조용한', 'easy'),
    ('fast', '빠른', 'easy'), ('slow', '느린', 'easy'),
    
    # Medium (25개)
    ('orchestra', '오케스트라', 'medium'), ('conductor', '지휘자', 'medium'), ('composer', '작곡가', 'medium'),
    ('symphony', '교향곡', 'medium'), ('harmony', '화음', 'medium'), ('chord', '화음', 'medium'),
    ('scale', '음계', 'medium'), ('octave', '옥타브', 'medium'), ('pitch', '음높이', 'medium'),
    ('tempo', '템포', 'medium'), ('dynamics', '셈여림', 'medium'), ('timbre', '음색', 'medium'),
    ('genre', '장르', 'medium'), ('classical', '클래식', 'medium'), ('jazz', '재즈', 'medium'),
    ('rock', '록', 'medium'), ('pop', '팝', 'medium'), ('blues', '블루스', 'medium'),
    ('folk', '민속음악', 'medium'), ('opera', '오페라', 'medium'), ('aria', '아리아', 'medium'),
    ('ensemble', '앙상블', 'medium'), ('rehearsal', '리허설', 'medium'), ('performance', '공연', 'medium'),
    ('improvisation', '즉흥연주', 'medium'),
    
    # Hard (15개)
    ('counterpoint', '대위법', 'hard'), ('polyphony', '다성음악', 'hard'), ('monophony', '단성음악', 'hard'),
    ('homophony', '화성음악', 'hard'), ('cadence', '종지', 'hard'), ('modulation', '전조', 'hard'),
    ('chromaticism', '반음계주의', 'hard'), ('atonality', '무조성', 'hard'), ('serialism', '음렬주의', 'hard'),
    ('fugue', '푸가', 'hard'), ('sonata', '소나타', 'hard'), ('concerto', '협주곡', 'hard'),
    ('oratorio', '오라토리오', 'hard'), ('cantata', '칸타타', 'hard'), ('libretto', '대본', 'hard'),
]

for word, korean, diff in music_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Music', 'difficulty': diff})

# Art (60개)
art_words = [
    # Easy (20개)
    ('art', '예술', 'easy'), ('paint', '그리다', 'easy'), ('draw', '그리다', 'easy'),
    ('color', '색', 'easy'), ('brush', '붓', 'easy'), ('canvas', '캔버스', 'easy'),
    ('picture', '그림', 'easy'), ('artist', '예술가', 'easy'), ('gallery', '갤러리', 'easy'),
    ('statue', '조각상', 'easy'), ('portrait', '초상화', 'easy'), ('landscape', '풍경화', 'easy'),
    ('sketch', '스케치', 'easy'), ('design', '디자인', 'easy'), ('pattern', '패턴', 'easy'),
    ('shape', '모양', 'easy'), ('line', '선', 'easy'), ('texture', '질감', 'easy'),
    ('style', '스타일', 'easy'), ('image', '이미지', 'easy'),
    
    # Medium (25개)
    ('masterpiece', '걸작', 'medium'), ('exhibition', '전시회', 'medium'), ('sculpture', '조각', 'medium'),
    ('installation', '설치미술', 'medium'), ('abstract', '추상적인', 'medium'), ('realistic', '사실적인', 'medium'),
    ('impressionism', '인상주의', 'medium'), ('expressionism', '표현주의', 'medium'), ('cubism', '입체주의', 'medium'),
    ('surrealism', '초현실주의', 'medium'), ('renaissance', '르네상스', 'medium'), ('baroque', '바로크', 'medium'),
    ('contemporary', '현대의', 'medium'), ('perspective', '원근법', 'medium'), ('composition', '구도', 'medium'),
    ('proportion', '비율', 'medium'), ('symmetry', '대칭', 'medium'), ('contrast', '대비', 'medium'),
    ('palette', '팔레트', 'medium'), ('pigment', '안료', 'medium'), ('watercolor', '수채화', 'medium'),
    ('acrylic', '아크릴', 'medium'), ('fresco', '프레스코', 'medium'), ('mural', '벽화', 'medium'),
    ('printmaking', '판화', 'medium'),
    
    # Hard (15개)
    ('chiaroscuro', '명암법', 'hard'), ('sfumato', '스푸마토', 'hard'), ('impasto', '임파스토', 'hard'),
    ('pointillism', '점묘법', 'hard'), ('fauvism', '야수파', 'hard'), ('dadaism', '다다이즘', 'hard'),
    ('minimalism', '미니멀리즘', 'hard'), ('postmodernism', '포스트모더니즘', 'hard'), ('avant-garde', '아방가르드', 'hard'),
    ('provenance', '출처', 'hard'), ('patina', '녹청', 'hard'), ('gesso', '석고', 'hard'),
    ('encaustic', '밀랍화', 'hard'), ('lithography', '석판화', 'hard'), ('etching', '에칭', 'hard'),
]

for word, korean, diff in art_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Art', 'difficulty': diff})

# Science (60개)
science_words = [
    # Easy (20개)
    ('science', '과학', 'easy'), ('experiment', '실험', 'easy'), ('test', '시험', 'easy'),
    ('lab', '실험실', 'easy'), ('scientist', '과학자', 'easy'), ('chemistry', '화학', 'easy'),
    ('physics', '물리학', 'easy'), ('biology', '생물학', 'easy'), ('atom', '원자', 'easy'),
    ('molecule', '분자', 'easy'), ('cell', '세포', 'easy'), ('energy', '에너지', 'easy'),
    ('force', '힘', 'easy'), ('gravity', '중력', 'easy'), ('light', '빛', 'easy'),
    ('sound', '소리', 'easy'), ('heat', '열', 'easy'), ('water', '물', 'easy'),
    ('air', '공기', 'easy'), ('oxygen', '산소', 'easy'),
    
    # Medium (25개)
    ('hypothesis', '가설', 'medium'), ('theory', '이론', 'medium'), ('observation', '관찰', 'medium'),
    ('analysis', '분석', 'medium'), ('conclusion', '결론', 'medium'), ('variable', '변수', 'medium'),
    ('control', '대조군', 'medium'), ('data', '데이터', 'medium'), ('measurement', '측정', 'medium'),
    ('microscope', '현미경', 'medium'), ('telescope', '망원경', 'medium'), ('catalyst', '촉매', 'medium'),
    ('reaction', '반응', 'medium'), ('compound', '화합물', 'medium'), ('element', '원소', 'medium'),
    ('organism', '유기체', 'medium'), ('species', '종', 'medium'), ('evolution', '진화', 'medium'),
    ('genetics', '유전학', 'medium'), ('chromosome', '염색체', 'medium'), ('protein', '단백질', 'medium'),
    ('enzyme', '효소', 'medium'), ('bacteria', '박테리아', 'medium'), ('nucleus', '핵', 'medium'),
    ('membrane', '막', 'medium'),
    
    # Hard (15개)
    ('quantum mechanics', '양자역학', 'hard'), ('relativity', '상대성이론', 'hard'), ('thermodynamics', '열역학', 'hard'),
    ('electromagnetism', '전자기학', 'hard'), ('spectroscopy', '분광학', 'hard'), ('chromatography', '크로마토그래피', 'hard'),
    ('stoichiometry', '화학양론', 'hard'), ('biochemistry', '생화학', 'hard'), ('cytology', '세포학', 'hard'),
    ('phylogenetics', '계통발생학', 'hard'), ('taxonomy', '분류학', 'hard'), ('morphology', '형태학', 'hard'),
    ('physiology', '생리학', 'hard'), ('homeostasis', '항상성', 'hard'), ('osmosis', '삼투', 'hard'),
]

for word, korean, diff in science_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Science', 'difficulty': diff})

# History (60개)
history_words = [
    # Easy (20개)
    ('history', '역사', 'easy'), ('past', '과거', 'easy'), ('ancient', '고대의', 'easy'),
    ('king', '왕', 'easy'), ('queen', '여왕', 'easy'), ('war', '전쟁', 'easy'),
    ('battle', '전투', 'easy'), ('soldier', '군인', 'easy'), ('castle', '성', 'easy'),
    ('empire', '제국', 'easy'), ('century', '세기', 'easy'), ('year', '년', 'easy'),
    ('event', '사건', 'easy'), ('hero', '영웅', 'easy'), ('legend', '전설', 'easy'),
    ('story', '이야기', 'easy'), ('old', '오래된', 'easy'), ('new', '새로운', 'easy'),
    ('change', '변화', 'easy'), ('time', '시간', 'easy'),
    
    # Medium (25개)
    ('civilization', '문명', 'medium'), ('dynasty', '왕조', 'medium'), ('monarchy', '군주제', 'medium'),
    ('republic', '공화국', 'medium'), ('revolution', '혁명', 'medium'), ('independence', '독립', 'medium'),
    ('colonization', '식민지화', 'medium'), ('treaty', '조약', 'medium'), ('alliance', '동맹', 'medium'),
    ('conquest', '정복', 'medium'), ('invasion', '침략', 'medium'), ('rebellion', '반란', 'medium'),
    ('reformation', '종교개혁', 'medium'), ('enlightenment', '계몽주의', 'medium'), ('industrial revolution', '산업혁명', 'medium'),
    ('archaeology', '고고학', 'medium'), ('artifact', '유물', 'medium'), ('excavation', '발굴', 'medium'),
    ('manuscript', '필사본', 'medium'), ('chronicle', '연대기', 'medium'), ('heritage', '유산', 'medium'),
    ('legacy', '유산', 'medium'), ('tradition', '전통', 'medium'), ('customs', '관습', 'medium'),
    ('migration', '이주', 'medium'),
    
    # Hard (15개)
    ('historiography', '역사학', 'hard'), ('feudalism', '봉건제', 'hard'), ('imperialism', '제국주의', 'hard'),
    ('totalitarianism', '전체주의', 'hard'), ('absolutism', '절대주의', 'hard'), ('mercantilism', '중상주의', 'hard'),
    ('renaissance humanism', '르네상스인문주의', 'hard'), ('scholasticism', '스콜라철학', 'hard'), ('secularization', '세속화', 'hard'),
    ('nationalism', '민족주의', 'hard'), ('colonialism', '식민주의', 'hard'), ('decolonization', '탈식민화', 'hard'),
    ('hegemony', '패권', 'hard'), ('sovereignty', '주권', 'hard'), ('legitimacy', '정당성', 'hard'),
]

for word, korean, diff in history_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'History', 'difficulty': diff})

# Politics (60개)
politics_words = [
    # Easy (20개)
    ('politics', '정치', 'easy'), ('government', '정부', 'easy'), ('president', '대통령', 'easy'),
    ('vote', '투표', 'easy'), ('election', '선거', 'easy'), ('law', '법', 'easy'),
    ('rule', '규칙', 'easy'), ('leader', '지도자', 'easy'), ('party', '정당', 'easy'),
    ('member', '구성원', 'easy'), ('citizen', '시민', 'easy'), ('right', '권리', 'easy'),
    ('duty', '의무', 'easy'), ('freedom', '자유', 'easy'), ('peace', '평화', 'easy'),
    ('power', '권력', 'easy'), ('policy', '정책', 'easy'), ('public', '공공의', 'easy'),
    ('nation', '국가', 'easy'), ('state', '국가', 'easy'),
    
    # Medium (25개)
    ('democracy', '민주주의', 'medium'), ('dictatorship', '독재', 'medium'), ('parliament', '의회', 'medium'),
    ('congress', '의회', 'medium'), ('senate', '상원', 'medium'), ('legislation', '입법', 'medium'),
    ('constitution', '헌법', 'medium'), ('amendment', '수정안', 'medium'), ('referendum', '국민투표', 'medium'),
    ('campaign', '선거운동', 'medium'), ('candidate', '후보자', 'medium'), ('ballot', '투표용지', 'medium'),
    ('coalition', '연합', 'medium'), ('opposition', '야당', 'medium'), ('cabinet', '내각', 'medium'),
    ('ministry', '부처', 'medium'), ('bureaucracy', '관료제', 'medium'), ('diplomacy', '외교', 'medium'),
    ('embassy', '대사관', 'medium'), ('ambassador', '대사', 'medium'), ('sanctions', '제재', 'medium'),
    ('propaganda', '선전', 'medium'), ('ideology', '이데올로기', 'medium'), ('corruption', '부패', 'medium'),
    ('transparency', '투명성', 'medium'),
    
    # Hard (15개)
    ('bicameral', '양원제의', 'hard'), ('unicameral', '단원제의', 'hard'), ('federalism', '연방주의', 'hard'),
    ('separation of powers', '권력분립', 'hard'), ('checks and balances', '견제와균형', 'hard'), ('judicial review', '사법심사', 'hard'),
    ('gerrymandering', '게리맨더링', 'hard'), ('filibuster', '의사진행방해', 'hard'), ('lobbying', '로비활동', 'hard'),
    ('ratification', '비준', 'hard'), ('veto', '거부권', 'hard'), ('impeachment', '탄핵', 'hard'),
    ('pluralism', '다원주의', 'hard'), ('authoritarianism', '권위주의', 'hard'), ('populism', '포퓰리즘', 'hard'),
]

for word, korean, diff in politics_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Politics', 'difficulty': diff})

# Economy (60개)
economy_words = [
    # Easy (20개)
    ('money', '돈', 'easy'), ('buy', '사다', 'easy'), ('sell', '팔다', 'easy'),
    ('price', '가격', 'easy'), ('cost', '비용', 'easy'), ('cheap', '싼', 'easy'),
    ('expensive', '비싼', 'easy'), ('shop', '가게', 'easy'), ('market', '시장', 'easy'),
    ('store', '상점', 'easy'), ('bank', '은행', 'easy'), ('save', '저축하다', 'easy'),
    ('spend', '쓰다', 'easy'), ('earn', '벌다', 'easy'), ('pay', '지불하다', 'easy'),
    ('cash', '현금', 'easy'), ('card', '카드', 'easy'), ('coin', '동전', 'easy'),
    ('bill', '지폐', 'easy'), ('change', '거스름돈', 'easy'),
    
    # Medium (25개)
    ('economy', '경제', 'medium'), ('finance', '금융', 'medium'), ('trade', '무역', 'medium'),
    ('commerce', '상업', 'medium'), ('industry', '산업', 'medium'), ('supply', '공급', 'medium'),
    ('demand', '수요', 'medium'), ('inflation', '인플레이션', 'medium'), ('deflation', '디플레이션', 'medium'),
    ('recession', '경기침체', 'medium'), ('depression', '대공황', 'medium'), ('growth', '성장', 'medium'),
    ('stock', '주식', 'medium'), ('bond', '채권', 'medium'), ('interest', '이자', 'medium'),
    ('loan', '대출', 'medium'), ('debt', '부채', 'medium'), ('credit', '신용', 'medium'),
    ('tax', '세금', 'medium'), ('tariff', '관세', 'medium'), ('subsidy', '보조금', 'medium'),
    ('monopoly', '독점', 'medium'), ('competition', '경쟁', 'medium'), ('consumer', '소비자', 'medium'),
    ('producer', '생산자', 'medium'),
    
    # Hard (15개)
    ('macroeconomics', '거시경제학', 'hard'), ('microeconomics', '미시경제학', 'hard'), ('fiscal policy', '재정정책', 'hard'),
    ('monetary policy', '통화정책', 'hard'), ('quantitative easing', '양적완화', 'hard'), ('derivatives', '파생상품', 'hard'),
    ('securitization', '증권화', 'hard'), ('liquidity', '유동성', 'hard'), ('volatility', '변동성', 'hard'),
    ('arbitrage', '차익거래', 'hard'), ('portfolio', '포트폴리오', 'hard'), ('diversification', '분산투자', 'hard'),
    ('hedge fund', '헤지펀드', 'hard'), ('venture capital', '벤처캐피탈', 'hard'), ('equity', '자본', 'hard'),
]

for word, korean, diff in economy_words:
    words_data.append({'word': word, 'korean': korean, 'category': 'Economy', 'difficulty': diff})

print(f"총 {len(words_data)}개 단어 데이터 생성 완료")

# 배치로 나누어 삽입 (한 번에 100개씩)
batch_size = 100
total_inserted = 0

for i in range(0, len(words_data), batch_size):
    batch = words_data[i:i+batch_size]
    try:
        result = supabase.table('english_words').insert(batch).execute()
        total_inserted += len(batch)
        print(f"배치 {i//batch_size + 1}: {len(batch)}개 단어 추가 완료 (누적: {total_inserted}개)")
    except Exception as e:
        print(f"배치 {i//batch_size + 1} 오류: {e}")
        break

print(f"\n최종 결과: {total_inserted}개 단어 추가 완료!")
