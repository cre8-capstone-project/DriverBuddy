import {createContext, useContext, ReactNode} from 'react';
import {useFaceDetection} from '@/features/safety-alert/hooks/useFaceDetection';

type FaceDetectionContextType = ReturnType<typeof useFaceDetection>;
const FaceDetectionContext = createContext<FaceDetectionContextType | undefined>(undefined);

export const FaceDetectionProvider = ({children}: {children: ReactNode}) => {
  const faceDetection = useFaceDetection();

  return (
    <FaceDetectionContext.Provider value={faceDetection}>{children}</FaceDetectionContext.Provider>
  );
};

export const useFaceDetectionContext = () => {
  const context = useContext(FaceDetectionContext);
  if (!context) {
    throw new Error('useFaceDetectionContext must be used within a FaceDetectionProvider');
  }
  return context;
};
