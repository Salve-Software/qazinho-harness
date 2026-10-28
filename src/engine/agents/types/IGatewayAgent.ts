import type { IModelClient } from './IModelClient';

/** O cliente com que um agente do gateway chama o modelo, e o modelo que ele pede. */
export interface IGatewayAgent {
  client: IModelClient;
  model: string;
}
