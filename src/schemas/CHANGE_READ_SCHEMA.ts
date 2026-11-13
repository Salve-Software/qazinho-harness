import { jsonSchemaOf } from '@/library/jsonSchemaOf';
import { CHANGE_READ } from './CHANGE_READ';

export const CHANGE_READ_SCHEMA = JSON.stringify(jsonSchemaOf(CHANGE_READ));
