type Message = {
  message?: string;
  voice?: any;
  sound?: any;
};

// Preload the sound files using require
const soundMap: {[key: string]: any} = {
  '3-beeps-mid-pitch.mp3': require('@/assets/sounds/3-beeps-mid-pitch.mp3'),
  'message1-1.mp3': require('@/assets/sounds/message1-1.mp3'),
  'message1-2.mp3': require('@/assets/sounds/message1-2.mp3'),
  'message2-1.mp3': require('@/assets/sounds/message2-1.mp3'),
  'message2-2.mp3': require('@/assets/sounds/message2-2.mp3'),
  'message3-1.mp3': require('@/assets/sounds/message3-1.mp3'),
  'message3-2.mp3': require('@/assets/sounds/message3-2.mp3'),
};

export const DRAWSINESS_ALERT_MESSAGE: Message[] = [
  {
    message: 'Why not take a short break? A quick rest can help you stay sharp!',
    voice: soundMap['message1-1.mp3'],
    sound: soundMap['3-beeps-mid-pitch.mp3'],
  },
  {
    message: 'You are looking drowsy. Stay alert and take a break if needed!',
    voice: soundMap['message1-2.mp3'],
    sound: soundMap['3-beeps-mid-pitch.mp3'],
  },
];

export const DISTRACTED_WARNING_MESSAGE: Message[] = [
  {
    message: 'Pay attention to the traffic ahead!',
    voice: soundMap['message2-1.mp3'],
    sound: soundMap['3-beeps-mid-pitch.mp3'],
  },
  {
    message: 'Keep your eyes on the road!',
    voice: soundMap['message2-2.mp3'],
    sound: soundMap['3-beeps-mid-pitch.mp3'],
  },
];

export const INSTRUCTION_MESSAGE: Message[] = [
  {
    message: 'Face recognition has started. Please align your face to the center of the screen.',
    voice: soundMap['message3-1.mp3'],
  },
  {
    message: 'There are rest stops nearby. Please consider taking a break.',
    voice: soundMap['message3-2.mp3'],
  },
];
