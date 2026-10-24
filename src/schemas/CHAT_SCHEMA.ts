import { jsonSchemaOf } from '@/library/jsonSchemaOf';
import { CHAT_ANSWER } from './CHAT_ANSWER';

export const CHAT_SCHEMA = JSON.stringify(jsonSchemaOf(CHAT_ANSWER));
