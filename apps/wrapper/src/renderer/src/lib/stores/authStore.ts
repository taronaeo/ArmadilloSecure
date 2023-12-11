import type { UserDocument } from '@armadillo/shared';
import type { User } from 'firebase/auth';

import { derived, readable } from 'svelte/store';

import { doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../firebase';
import { docStore, colUsersRef } from '../firebase/firestore';

const authState = readable<User | null>(undefined, (set) => {
  const unsubscribe = onAuthStateChanged(auth, set);
  return unsubscribe;
});

export const authStore = derived<typeof authState, UserDocument | null>(authState, ($user, set) => {
  if (!$user) return set($user);

  const ref = doc(colUsersRef, $user.uid);
  return docStore<UserDocument>(ref).subscribe(set);
});
