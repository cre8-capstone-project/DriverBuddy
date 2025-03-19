import {createContext, useContext, ReactNode, useState} from 'react';
import type {ViewModeType} from '@/types/ViewModeType';

type FaceDetectionContextType = {
  alertCount: number;
  setAlertCount: React.Dispatch<React.SetStateAction<number>>;
  viewModeContext: ViewModeType;
  setViewModeContext: React.Dispatch<React.SetStateAction<ViewModeType>>;
  alertStatus: boolean;
  setAlertStatus: React.Dispatch<React.SetStateAction<boolean>>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  instructionStatus: boolean;
  setInstructionStatus: React.Dispatch<React.SetStateAction<boolean>>;
};

const FaceDetectionContext = createContext<FaceDetectionContextType | undefined>(undefined);

export const FaceDetectionProvider = ({children}: {children: ReactNode}) => {
  const [alertCount, setAlertCount] = useState(0);
  const [alertStatus, setAlertStatus] = useState(false);
  const [message, setMessage] = useState('');
  const [instructionStatus, setInstructionStatus] = useState(false);
  const [viewModeContext, setViewModeContext] = useState<ViewModeType>('mapView');

  return (
    <FaceDetectionContext.Provider
      value={{
        alertCount,
        setAlertCount,
        viewModeContext,
        setViewModeContext,
        alertStatus,
        setAlertStatus,
        message,
        setMessage,
        instructionStatus,
        setInstructionStatus,
      }}>
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
