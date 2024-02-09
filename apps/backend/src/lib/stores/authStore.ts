import type { FSUser } from '@armadillo/shared';
import type { User } from 'firebase/auth';

import { derived, readable } from 'svelte/store';

import { doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '$lib/firebase';
import { docStore, colUsersRef } from '$lib/firebase/firestore';

export const authState = readable<User | null>(undefined, (set) => {
  // Prevent server-side from running
  if (typeof window === 'undefined') return;

  const unsubscribe = onAuthStateChanged(auth, set);
  return unsubscribe;
});

export const authStore = derived<typeof authState, FSUser | null>(authState, ($user, set) => {
  // Prevent server-side from running
  if (typeof window === 'undefined') return;

  if (!$user) return set(null);

  const ref = doc(colUsersRef, $user.uid);
  return docStore<FSUser>(ref).subscribe(set);
});
