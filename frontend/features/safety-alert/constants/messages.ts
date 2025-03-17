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
    message: "If your eyelids are heavier than your car, it's time for a break!",
    sound: soundMap['loud-siren.mp3'],
  },
  {
    message: 'Your destination will wait. Sleep now, arrive safely later!',
    sound: soundMap['loud-siren.mp3'],
  },
  {
    message: 'Sleep is free, but accidents are expensive. Rest up!',
    sound: soundMap['loud-siren.mp3'],
  },
];

export const DISTRACTED_WARNING_MESSAGE: Message[] = [
  {
    message: 'Keep your eyes on the road!',
    sound: soundMap['3-beeps-mid-pitch.mp3'],
  },
];
