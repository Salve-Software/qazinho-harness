/**
 * Como uma run anda os casos: pelas gravações e com o agente no resto (`plan`), só pelas
 * gravações (`recorded`), ou todo caso pelo agente (`agent`).
 */
export type WalkMode = 'plan' | 'recorded' | 'agent';
