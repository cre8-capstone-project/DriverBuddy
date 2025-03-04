import React, {createContext, useContext, useEffect, useState} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

// Define Auth Context
const AuthContext = createContext<{
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

// Auth Provider Component
export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{user, loading}}>{children}</AuthContext.Provider>;
};

// Custom Hook to use Auth Context
export const useAuth = () => useContext(AuthContext);
