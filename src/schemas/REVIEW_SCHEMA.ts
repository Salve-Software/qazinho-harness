import { jsonSchemaOf } from '@/library/jsonSchemaOf';
import { REVIEW_ANSWER } from './REVIEW_ANSWER';

export const REVIEW_SCHEMA = JSON.stringify(jsonSchemaOf(REVIEW_ANSWER));
