/**
 * The Firebase web app's identifiers (project sree-90321). They are public by
 * design: every Firebase web app ships them to the browser, and the Firestore
 * security rules are what protect each user's data. The API key is also limited
 * to this site's domains in Google Cloud (docs/accounts-and-sync-plan.md).
 */
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBNy78Th-3EAPTp9gWLHfJlq3IW1cS7DLo',
  authDomain: 'sree-90321.firebaseapp.com',
  projectId: 'sree-90321',
  storageBucket: 'sree-90321.firebasestorage.app',
  messagingSenderId: '947518705595',
  appId: '1:947518705595:web:a27a2eaedb86833187fe9e',
} as const;
