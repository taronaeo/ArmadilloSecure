import { FSMetadata } from '@armadillo/shared';

interface FSUser extends FSMetadata {
  readonly uid: string;
  readonly faceId: string | null;
  email: string | undefined;
  readonly email_verified: boolean | null;
  full_name: string | null;
  headshot_url: string | null;
  readonly is_onboarded: boolean;
  readonly is_suspended: boolean;
}

export type { FSUser };
