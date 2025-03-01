import {useRef} from 'react';
import Toast from 'react-native-root-toast';
import {Dimensions} from 'react-native';

type SnackBarOption = {
  duration: number;
  position: number;
};

export const useSnackBar = () => {
  const toastRef = useRef(null);

  const showSnackBar = (
    message: string,
    options: SnackBarOption = {
      duration: Toast.durations.SHORT,
      position: Dimensions.get('window').height - 140,
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
      backgroundColor: 'rgba(0, 0, 0, 1)',
      textColor: 'white',
    });
  };

  return {showSnackBar};
};
