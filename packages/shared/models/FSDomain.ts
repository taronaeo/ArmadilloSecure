import { FSMetadata } from '@armadillo/shared';

interface FSDomain extends FSMetadata {
  domain_dns_suffix: string | null;
  domain_ipv4_start: string | null;
  domain_ipv4_end: string | null;
  domain_administrators: string[];
}

export type { FSDomain };
