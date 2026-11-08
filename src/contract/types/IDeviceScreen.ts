/** Uma tela aberta num navegador: o endereço, a conta, e se o agente está nela. */
export interface IDeviceScreen {
  id: number;
  url: string;
  isAgent: boolean;
  account: number;
}
