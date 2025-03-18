type Message = {
  message: string;
  sound: any;
};

// Preload the sound files using require
const soundMap: {[key: string]: any} = {
  '3-beeps-mid-pitch.mp3': require('@/assets/sounds/3-beeps-mid-pitch.mp3'),
  'loud-siren.mp3': require('@/assets/sounds/loud-siren.mp3'),
  // Add other sound files here
};

export const DRAWSINESS_ALERT_MESSAGE: Message[] = [
  {
    message: 'Why not take a short break? A quick rest can help you stay sharp!',
    sound: soundMap['3-beeps-mid-pitch.mp3'],
  },
  {
    message: 'Hey, you’re looking a little sleepy!',
    sound: soundMap['3-beeps-mid-pitch.mp3'],
  },
];

export const DISTRACTED_WARNING_MESSAGE: Message[] = [
  {
    message: 'Keep your eyes on the road!',
    sound: soundMap['3-beeps-mid-pitch.mp3'],
  },
];
