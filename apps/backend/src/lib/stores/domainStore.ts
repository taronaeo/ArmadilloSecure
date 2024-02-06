import type { FSDomain } from '@armadillo/shared';

import { derived } from 'svelte/store';
import { doc } from 'firebase/firestore';

import { authState } from '$lib/stores';
import { colDomainsRef, docStore } from '$lib/firebase/firestore';

export const domainStore = derived<typeof authState, FSDomain | null>(authState, ($user, set) => {
  if (typeof window === 'undefined') return;

  if (!$user) return set(null);

  const ref = doc(colDomainsRef, $user.email?.split('@').pop());
  return docStore<FSDomain>(ref).subscribe(set);
});
