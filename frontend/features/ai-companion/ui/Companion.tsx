import React, {useState} from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';
import {useOpenAI} from '@/hooks/useOpenAI';
import {useVoice} from '../hooks/useVoice';
import {useSpeech} from '@/hooks/useSpeech';
import {Ionicons} from '@expo/vector-icons';

const Companion: React.FC = () => {
  const {startRecording, stopRecording} = useVoice();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const {speak, isSpeaking} = useSpeech();
  const {generateMessage} = useOpenAI();

  const handleToggle = (): void => {
    setIsEnabled(prev => !prev);
    if (isEnabled) {
      setIsListening(false); // Reset listening state if disabled
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handleListen = async (): Promise<void> => {
    if (!isEnabled || isListening) return;

    setIsListening(true);

    try {
      await startRecording();
      /*
      // Simulated transcription (replace with actual transcription logic)
      const userInput: string = 'What is the best route to my destination?';
      const response = await generateMessage(userInput);

      if (response) {
        speak(response);
      }
        */
    } catch (error) {
      console.error('Error processing input:', error);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.floatingButton, isEnabled ? styles.enabled : styles.disabled]}
        onPress={handleToggle}>
        <Ionicons
          name={isEnabled ? 'mic' : 'mic-off'}
          size={24}
          color={isEnabled ? 'white' : 'gray'}
        />
      </TouchableOpacity>

      {isEnabled && (
        <TouchableOpacity
          style={[styles.listeningButton, isListening ? styles.activeListening : null]}
          onPress={handleListen}
          disabled={isListening || isSpeaking}>
          <Text style={styles.listeningText}>{isListening ? 'Listening...' : 'Tap to Speak'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#6200ea',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  enabled: {
    backgroundColor: '#6200ea',
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  listeningButton: {
    width: '80%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#6200ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeListening: {
    backgroundColor: '#3700b3',
  },
  listeningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Companion;
