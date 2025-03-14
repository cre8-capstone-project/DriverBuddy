import {createContext, useContext, ReactNode, useState} from 'react';

type OnboardingTourContextType = {
  showOnboarding: boolean;
  setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>;
};

const OnboardingTourContext = createContext<OnboardingTourContextType | undefined>(undefined);

export const OnboardingTourProvider = ({children}: {children: ReactNode}) => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <OnboardingTourContext.Provider value={{showOnboarding, setShowOnboarding}}>
      {children}
    </OnboardingTourContext.Provider>
  );
};

export const useOnboardingTourContext = () => {
  const context = useContext(OnboardingTourContext);
  if (!context) {
    throw new Error('useOnboardingTourContext must be used within a OnboardingTourProvider');
  }
  return context;
};
