import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '../types/auth';

export const signUp = async (
  email: string,
  password: string,
  role: UserRole = 'viewer'
): Promise<UserProfile> => {
  console.log('Attempting sign up:', { email, role });
  try {
    // Créer l'utilisateur dans Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created:', user.email);
    
    // Créer le profil utilisateur
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: email.split('@')[0], // Nom d'affichage par défaut
      role,
      permissions: ['view_projects', 'view_analytics'],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      level: 1,
      points: 0,
      badges: [],
      skills: []
    };

    // Sauvegarder le profil dans Firestore
    await setDoc(doc(db, 'users', user.uid), userProfile);
    console.log('User profile created');
    
    return userProfile;
  } catch (error: any) {
    console.error('Error during sign up:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Cette adresse email est déjà utilisée');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Adresse email invalide');
    }
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('La création de compte est temporairement désactivée');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Le mot de passe est trop faible');
    }
    throw new Error('Erreur lors de la création du compte');
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<UserProfile> => {
  console.log('Attempting sign in:', { email });
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in:', user.email);
    
    const userProfile = await getUserProfile(user.uid);
    
    // Mettre à jour la dernière connexion
    await setDoc(
      doc(db, 'users', user.uid),
      { lastLogin: new Date().toISOString() },
      { merge: true }
    );

    return userProfile;
  } catch (error: any) {
    console.error('Error during sign in:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Email ou mot de passe incorrect');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
    }
    throw new Error('Erreur lors de la connexion');
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile> => {
  console.log('Fetching user profile:', uid);
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      console.error('User profile not found');
      throw new Error('Profil utilisateur introuvable');
    }
    console.log('Profile found:', userDoc.data());
    return userDoc.data() as UserProfile;
  } catch (error: any) {
    console.error('Error loading user profile:', error);
    throw new Error('Erreur lors du chargement du profil');
  }
};

export const signOut = async (): Promise<void> => {
  console.log('Attempting sign out');
  try {
    await firebaseSignOut(auth);
    console.log('User signed out');
  } catch (error: any) {
    console.error('Error during sign out:', error);
    throw new Error('Erreur lors de la déconnexion');
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  console.log('Attempting password reset:', email);
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent');
  } catch (error: any) {
    console.error('Error during password reset:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('Aucun compte associé à cette adresse email');
    }
    throw new Error('Erreur lors de la réinitialisation du mot de passe');
  }
};

export const hasPermission = (
  userProfile: UserProfile | null,
  permission: string
): boolean => {
  if (!userProfile) return false;
  return userProfile.permissions.includes(permission) || 
         userProfile.role === 'admin' || 
         userProfile.role === 'superadmin';
};