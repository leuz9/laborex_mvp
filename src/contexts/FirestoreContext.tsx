import React, { createContext, useContext } from 'react';
import * as firestoreService from '../lib/firestore';

const FirestoreContext = createContext<typeof firestoreService | null>(null);

export const useFirestore = () => {
  const context = useContext(FirestoreContext);
  if (!context) {
    throw new Error('useFirestore must be used within a FirestoreProvider');
  }
  return context;
};

export const FirestoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FirestoreContext.Provider value={firestoreService}>
      {children}
    </FirestoreContext.Provider>
  );
};