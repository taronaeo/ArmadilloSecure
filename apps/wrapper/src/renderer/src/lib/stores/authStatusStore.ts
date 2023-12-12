import type { AppAuthStatusStore } from '@armadillo/shared';

import { writable } from 'svelte/store';

export const authStatusStore = writable<AppAuthStatusStore | null>(null);
