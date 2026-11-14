import { jsonSchemaOf } from '@/library/jsonSchemaOf';
import { SKILL_DRAFT } from './SKILL_DRAFT';

export const SKILL_SCHEMA = JSON.stringify(jsonSchemaOf(SKILL_DRAFT));
