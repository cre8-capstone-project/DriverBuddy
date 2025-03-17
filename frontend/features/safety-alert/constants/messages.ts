type Message = {
  message: string;
  sound: string;
};

export const DRAWSINESS_ALERT_MESSAGE: Message[] = [
  {
    message: "If your eyelids are heavier than your car, it's time for a break!",
    sound: '3-beeps-mid-pitch.mp3',
  },
  {
    message: 'Your destination will wait. Sleep now, arrive safely later!',
    sound: '3-beeps-mid-pitch.mp3',
  },
  {
    message: 'Sleep is free, but accidents are expensive. Rest up!',
    sound: '3-beeps-mid-pitch.mp3',
  },
];

export const DISTRACTED_WARNING_MESSAGE: Message[] = [
  {
    message: 'Keep your eyes on the road!',
    sound: '3-beeps-mid-pitch.mp3',
  },
];
