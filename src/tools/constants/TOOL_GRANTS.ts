import type { IToolGrant } from '@/tools/types';

export const TOOL_GRANTS: readonly IToolGrant[] = [
  { group: 'device', roles: ['runner', 'explorer'] },
  { group: 'app', roles: ['assistant'] },
  { group: 'suite', roles: ['automator'] },
  { group: 'sources', roles: ['chat'] },
];
