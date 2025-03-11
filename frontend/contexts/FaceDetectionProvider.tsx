import {createContext, useContext, ReactNode, useState} from 'react';

type FaceDetectionContextType = {
  alertCount: number;
  setAlertCount: React.Dispatch<React.SetStateAction<number>>;
};

const FaceDetectionContext = createContext<FaceDetectionContextType | undefined>(undefined);

export const FaceDetectionProvider = ({children}: {children: ReactNode}) => {
  const [alertCount, setAlertCount] = useState(0);

  return (
    <FaceDetectionContext.Provider value={{alertCount, setAlertCount}}>
      {children}
    </FaceDetectionContext.Provider>
  );
};

export const useFaceDetectionContext = () => {
  const context = useContext(FaceDetectionContext);
  if (!context) {
    throw new Error('useFaceDetectionContext must be used within a FaceDetectionProvider');
  }
  return context;
};
