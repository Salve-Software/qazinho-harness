import type { IModelClient } from './IModelClient';

/** The client a gateway agent calls the model with, and the model it asks for. */
export interface IGatewayAgent {
  client: IModelClient;
  model: string;
}
