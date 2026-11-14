import type { DeviceKey } from './DeviceKey';

/**
 * Um gesto do QA na tela do dispositivo, em frações da tela que ele vê: um toque, uma
 * rolagem, um arrasto, um texto ou uma tecla.
 */
export type DeviceInput =
  | { kind: 'tap'; x: number; y: number }
  | { kind: 'scroll'; x: number; y: number; dx: number; dy: number }
  | { kind: 'drag'; x: number; y: number; toX: number; toY: number }
  | { kind: 'type'; text: string }
  | { kind: 'key'; key: DeviceKey };
