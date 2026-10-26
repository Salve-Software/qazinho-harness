import { jsonSchemaOf } from '@/library/jsonSchemaOf';
import { PULL_ANSWER } from './PULL_ANSWER';

export const PULL_SCHEMA = JSON.stringify(jsonSchemaOf(PULL_ANSWER));
