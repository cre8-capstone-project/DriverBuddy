import {useRef} from 'react';
import {Audio} from 'expo-av';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';

export const usePlaySound = () => {
  const {setSoundData} = useFaceDetectionContext();
  const soundRef = useRef<Audio.Sound | null>(null);

  const playSound = async (soundUri: any, isAlert: boolean = false) => {
    try {
      const {sound} = await Audio.Sound.createAsync(soundUri, {shouldPlay: true});
      soundRef.current = sound;

      if (isAlert) {
        console.log('[DEBUG] Alert sound is stored in the context');
        setSoundData(sound);
      }

      await new Promise<void>(resolve => {
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded && status.didJustFinish) {
            resolve();
          }
        });
      });
      sound.setOnPlaybackStatusUpdate(null);
    } catch (error) {
      console.error('playSound error:', error);
      throw error;
    } finally {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        if (isAlert) {
          setSoundData(null);
          console.log('[DEBUG] Alert sound is removed from the context');
        }
      }
    }
  };

  return {playSound};
};
