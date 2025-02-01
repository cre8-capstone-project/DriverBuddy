import {useState, useRef} from 'react';
import * as Speech from 'expo-speech';

export const useSpeech = () => {
  const isSpeakingRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = (message: string) => {
    if (isSpeakingRef.current) return;

    isSpeakingRef.current = true;
    setIsSpeaking(true);
    Speech.speak(message, {
      language: 'en',
      pitch: 1.0,
      rate: 1.0,
      onDone: () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      },
    });
  };

  return {speak, isSpeaking};
};
