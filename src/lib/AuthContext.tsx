import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, isAdmin: false });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubAdmin: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Cleanup previous listeners
      if (unsubProfile) unsubProfile();
      if (unsubAdmin) unsubAdmin();

      if (currentUser) {
        // Ensure profile document exists (safety for cases where setDoc failed during signup)
        const checkProfile = async () => {
          const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (!profileDoc.exists()) {
            console.warn("Profile document missing for user:", currentUser.uid, ". Creating now...");
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email,
              username: currentUser.email?.split('@')[0] || "User",
              tier: 1,
              verified: currentUser.email === 'shawnexchange82@gmail.com' || currentUser.email === 'eemmpatech@gmail.com',
              totalTradeVolume: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          }
        };
        checkProfile();

        // Listen for profile changes
        unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data());
          }
        }, (err) => console.error("Profile sync error:", err));
        
        // Listen for admin status changes
        unsubAdmin = onSnapshot(doc(db, 'admins', currentUser.uid), (snapshot) => {
          const isHardcodedAdmin = ['shawnexchange82@gmail.com', 'eemmpatech@gmail.com'].includes(currentUser.email || '');
          setIsAdmin(snapshot.exists() || isHardcodedAdmin);
        }, (err) => console.error("Admin check error:", err));
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
      if (unsubAdmin) unsubAdmin();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
