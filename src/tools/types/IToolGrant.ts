import type { ToolGroup } from './ToolGroup';
import type { HarnessRole } from '@/types';

/**
 * Quais papéis podem usar um grupo de ferramentas; um papel que nenhuma permissão nomeia
 * não recebe ferramenta nenhuma.
 */
export interface IToolGrant {
  group: ToolGroup;
  roles: HarnessRole[];
}
