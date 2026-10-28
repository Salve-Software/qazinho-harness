/**
 * O que o agente concluiu de um bug visto de novo: algo que a issue ainda não diz, o bug
 * de volta depois que o time a fechou, ou nada novo.
 */
export type ReviewVerdict = 'news' | 'regression' | 'nothing-new';
