// 음성인식 + TTS 래퍼 훅
// Web Speech Recognition API + SpeechSynthesis API

import { useCallback, useRef, useState } from 'react';
import { PRONUNCIATION_FEEDBACK, randomMessage } from '@/lib/englishConstants';

interface SpeechResult {
  transcript: string;
  confidence: number;
  score: number;
  isMatch: boolean;
  needsRetry?: boolean;
}

interface PronunciationFeedback {
  score: number;
  message: string;
  tier: 'excellent' | 'good' | 'tryAgain';
  coins: number;
}

const SpeechRecognition = typeof window !== 'undefined'
  ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)
  : null;

export function usePronunciation() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(!!SpeechRecognition);
  const recognitionRef = useRef<any>(null);

  // TTS: 단어/문장 발음 재생
  const speak = useCallback((text: string, lang = 'en-US'): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85; // 아이용이라 약간 느리게
      utterance.pitch = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // STT: 음성인식 시작
  const startRecognition = useCallback((targetWord: string): Promise<SpeechResult> => {
    return new Promise((resolve) => {
      if (!SpeechRecognition) {
        resolve({ transcript: '', confidence: 0, score: 0, isMatch: false, needsRetry: true });
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;
        recognition.continuous = false;

        setIsListening(true);
        let resolved = false;

        recognition.onresult = (event: any) => {
          if (resolved) return;
          resolved = true;
          setIsListening(false);

          if (!event.results || event.results.length === 0) {
            resolve({ transcript: '', confidence: 0, score: 0, isMatch: false, needsRetry: true });
            return;
          }

          const results = Array.from(event.results[0]) as any[];
          const target = targetWord.toLowerCase().trim();
          const bestMatch = results.find(
            (r: any) => r.transcript.toLowerCase().trim() === target,
          );

          const confidence = bestMatch?.confidence ?? results[0]?.confidence ?? 0;
          const transcript = bestMatch?.transcript ?? results[0]?.transcript ?? '';

          resolve({
            transcript,
            confidence,
            score: Math.round(confidence * 100),
            isMatch: transcript.toLowerCase().trim() === target,
          });
        };

        recognition.onerror = () => {
          if (resolved) return;
          resolved = true;
          setIsListening(false);
          resolve({
            transcript: '',
            confidence: 0,
            score: 0,
            isMatch: false,
            needsRetry: true,
          });
        };

        recognition.onend = () => {
          setIsListening(false);
          // C1 수정: 사용자가 아무 말도 안 했으면 여기서 resolve
          if (!resolved) {
            resolved = true;
            resolve({ transcript: '', confidence: 0, score: 0, isMatch: false, needsRetry: true });
          }
        };

        recognition.start();

        // 10초 후 자동 중지
        setTimeout(() => {
          try { recognition.stop(); } catch { /* ignore */ }
        }, 10000);
      } catch {
        setIsListening(false);
        resolve({ transcript: '', confidence: 0, score: 0, isMatch: false, needsRetry: true });
      }
    });
  }, []);

  // 음성인식 중지
  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch { /* ignore */ }
    setIsListening(false);
  }, []);

  // 발음 피드백 생성
  const getFeedback = useCallback((score: number): PronunciationFeedback => {
    if (score >= 85) {
      return {
        score,
        message: randomMessage(PRONUNCIATION_FEEDBACK.excellent),
        tier: 'excellent',
        coins: 3,
      };
    }
    if (score >= 60) {
      return {
        score,
        message: randomMessage(PRONUNCIATION_FEEDBACK.good),
        tier: 'good',
        coins: 2,
      };
    }
    return {
      score,
      message: randomMessage(PRONUNCIATION_FEEDBACK.tryAgain),
      tier: 'tryAgain',
      coins: 1,
    };
  }, []);

  return {
    speak,
    startRecognition,
    stopRecognition,
    getFeedback,
    isListening,
    isSupported,
  };
}
