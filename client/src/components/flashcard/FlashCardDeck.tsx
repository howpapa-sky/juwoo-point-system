// 카드 덱 관리 — 매칭 게임 UI
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import type { MatchCard } from './useFlashCardSession';

interface Props {
  cards: MatchCard[];
  selectedCards: string[];
  matchMoves: number;
  onCardClick: (cardId: string) => void;
}

export default function FlashCardDeck({ cards, selectedCards, matchMoves, onCardClick }: Props) {
  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-1">짝을 찾아봐요! 🎯</h2>
        <p className="text-muted-foreground">영어와 뜻을 연결하세요</p>
        <Badge variant="outline" className="mt-2">시도 횟수: {matchMoves}</Badge>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
          >
            <Card
              onClick={() => onCardClick(card.id)}
              className={`h-24 md:h-28 cursor-pointer transition-all border-3 ${
                card.isMatched
                  ? 'bg-green-100 border-green-400 opacity-60'
                  : selectedCards.includes(card.id)
                  ? 'bg-purple-100 border-purple-500 shadow-lg'
                  : 'bg-white border-gray-200 hover:border-purple-300'
              }`}
            >
              <CardContent className="flex items-center justify-center h-full p-2">
                {card.isFlipped || card.isMatched ? (
                  <span className={`font-bold text-center ${
                    card.type === 'word' ? 'text-blue-600 text-lg md:text-xl' : 'text-purple-600 text-base md:text-lg'
                  }`}>
                    {card.content}
                  </span>
                ) : (
                  <span className="text-4xl">❓</span>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
