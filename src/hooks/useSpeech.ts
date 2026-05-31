import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, id: string) => {
    if (!window.speechSynthesis) {
      console.warn('Text-to-speech not supported in this browser.');
      return;
    }

    // If currently speaking this specific text, stop it (toggle off)
    if (isSpeaking && currentTextId === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentTextId(null);
      return;
    }

    // Cancel any ongoing speech before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set appropriate language voice
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9; // Slightly slower for better comprehension

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentTextId(id);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentTextId(null);
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error', e);
      setIsSpeaking(false);
      setCurrentTextId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [language, isSpeaking, currentTextId]);

  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentTextId(null);
    }
  }, []);

  return { speak, stop, isSpeaking, currentTextId };
};
