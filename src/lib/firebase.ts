import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAnycnHvsEFSrs-HjeoWQbXwrdrPZrO6wI",
  authDomain: "products-72b3d.firebaseapp.com",
  projectId: "products-72b3d",
  storageBucket: "products-72b3d.firebasestorage.app",
  messagingSenderId: "109088123640",
  appId: "1:109088123640:web:e836cd9a65091c0595290d",
  measurementId: "G-NHLD2B5G5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Règles Firestore
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fonctions utilitaires
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function hasRole(role) {
      return isAuthenticated() && getUserData().role == role;
    }

    function isSuperAdmin() {
      return isAuthenticated() && getUserData().role == 'superadmin';
    }

    function isAdmin() {
      return isAuthenticated() && (getUserData().role == 'admin' || getUserData().role == 'superadmin');
    }

    function hasPermission(permission) {
      return isAuthenticated() && (
        getUserData().permissions.hasAny([permission]) || 
        getUserData().role == 'superadmin'
      );
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Règles pour la collection users
    match /users/{userId} {
      allow read: if isAuthenticated() && (
        isOwner(userId) || 
        isAdmin() ||
        hasPermission('manage_users')
      );
      allow create: if isSuperAdmin();
      allow update: if isAuthenticated() && (
        (isOwner(userId) && request.resource.data.role == resource.data.role) || 
        isSuperAdmin()
      );
      allow delete: if isSuperAdmin();
    }

    // Règles pour la collection badges
    match /badges/{badgeId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Règles pour la collection gamification
    match /gamification/{userId} {
      allow read: if isAuthenticated() && (
        isOwner(userId) ||
        hasPermission('view_gamification') ||
        isAdmin()
      );
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && (
        isOwner(userId) ||
        hasPermission('manage_gamification') ||
        isAdmin()
      );
      allow delete: if isSuperAdmin();
    }

    // Règles pour la collection tasks
    match /tasks/{taskId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && (
        hasPermission('manage_tasks') || 
        isAdmin()
      );
      allow update: if isAuthenticated() && (
        hasPermission('manage_tasks') || 
        request.auth.uid in resource.data.assignees.id || 
        isAdmin()
      );
      allow delete: if isSuperAdmin();
    }

    // Règles pour la collection products
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && (
        hasPermission('manage_products') || 
        isAdmin()
      );
      allow update: if isAuthenticated() && (
        hasPermission('manage_products') || 
        isAdmin()
      );
      allow delete: if isSuperAdmin();
    }

    // Règles pour la collection feedback
    match /feedback/{feedbackId} {
      allow read: if isAuthenticated() && (
        resource.data.from.id == request.auth.uid ||
        resource.data.to.id == request.auth.uid ||
        (!resource.data.private && (hasPermission('view_feedback') || hasRole('viewer'))) ||
        isAdmin()
      );
      allow create: if isAuthenticated() && (
        request.resource.data.from.id == request.auth.uid ||
        hasPermission('submit_feedback') ||
        hasRole('viewer') ||
        hasPermission('manage_feedback')
      );
      allow update: if isAuthenticated() && (
        (resource.data.from.id == request.auth.uid && 
         request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['reactions'])) ||
        hasPermission('manage_feedback') ||
        isAdmin()
      );
      allow delete: if isSuperAdmin();
    }

    // Règles pour la collection notifications
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
      allow create: if isAuthenticated() && (
        request.resource.data.userId == request.auth.uid ||
        hasPermission('send_notifications') ||
        isAdmin()
      );
      allow update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid &&
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['read', 'readAt'])
      );
      allow delete: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        isAdmin()
      );
    }
  }
}`;

// Règles Storage
const storageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isSuperAdmin() {
      return isAuthenticated() && getUserData().role == 'superadmin';
    }

    function isAdmin() {
      return isAuthenticated() && (getUserData().role == 'admin' || getUserData().role == 'superadmin');
    }

    match /avatars/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() &&
        request.resource.size < 5 * 1024 * 1024 && // 5MB max
        request.resource.contentType.matches('image/.*');
      allow delete: if isAdmin();
    }
    
    match /products/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() &&
        request.resource.size < 5 * 1024 * 1024 && // 5MB max
        request.resource.contentType.matches('image/.*');
      allow delete: if isAdmin();
    }

    match /documents/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() &&
        request.resource.size < 10 * 1024 * 1024 && // 10MB max
        request.resource.contentType.matches('application/.*|text/.*');
      allow delete: if isAdmin();
    }
  }
}`;

export { app, auth, db, storage, firestoreRules, storageRules };