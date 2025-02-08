import {useState, useRef} from 'react';
import {Audio} from 'expo-av';
import axios from 'axios';
import {Alert} from 'react-native';
import {RecordingOptions} from 'expo-av/build/Audio';

export const useVoice = () => {
  const isRecordingRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording>();
  const [text, setText] = useState('');
  const [AIReposnse, setAIResponse] = useState(false);
  const [loading, setLoading] = useState(false);

  const getMicrophonePermission = async () => {
    try {
      const {granted} = await Audio.requestPermissionsAsync();
      if (granted) {
        return true;
      } else {
        Alert.alert('Permission', 'Permission denied');
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const recordingOptions: RecordingOptions = {
    android: {
      extension: '.wav',
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: '.wav',
      outputFormat: Audio.IOSOutputFormat.AC3,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      audioQuality: Audio.IOSAudioQuality.MIN,
    },
    web: {},
  };
  const startRecording = async () => {
    const hasPermission = await getMicrophonePermission();
    if (hasPermission) {
      try {
        await Audio.setAudioModeAsync({allowsRecordingIOS: true, playsInSilentModeIOS: true});
        setIsRecording(true);
        const {recording} = await Audio.Recording.createAsync(recordingOptions);
        setRecording(recording);
      } catch (error) {
        console.log('Failed to start recording: ' + error);
        Alert.alert('Error', 'Failed to start recording');
      }
    } else {
      return;
    }
  };
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setLoading(true);
      await recording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({allowsRecordingIOS: false});
      const uri = recording?.getURI();
      const transcript = await sendAudioToWhisper(uri);
      setText(transcript);
    } catch (error) {
      console.log('Failed to start recording: ' + error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };
  const sendAudioToWhisper = async (uri: string | null | undefined) => {
    try {
      const formData: any = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/wav',
        name: 'recording.wav',
      });
      formData.append('model', 'whisper-1');
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      console.log(response.data.text);
      return await response.data.text;
    } catch (error) {
      console.log(error);
    }
  };
  return {
    startRecording,
    stopRecording,
  };
};
