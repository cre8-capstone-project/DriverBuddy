import {useRef} from 'react';
import Toast from 'react-native-root-toast';
import {Dimensions} from 'react-native';

type SnackBarOption = {
  duration: number;
  position: number;
  backgroundColor?: string; // Cocoy's Update: Option to change backgroundColor
};

export const useSnackBar = () => {
  const toastRef = useRef(null);

  const showSnackBar = (
    message: string,
    options: SnackBarOption = {
      duration: Toast.durations.SHORT,
      position: Dimensions.get('window').height - 220,
    },
  ) => {
    if (toastRef.current) {
      Toast.hide(toastRef.current);
    }

    toastRef.current = Toast.show(message, {
      duration: options.duration,
      position: options.position,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      backgroundColor: options.backgroundColor ?? 'rgba(0, 0, 0, 1)', // Cocoy's Update: Option to change backgroundColor
      textColor: 'white',
    });
  };

  return {showSnackBar};
};
