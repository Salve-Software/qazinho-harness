/** Uma imagem da tela do dispositivo como o agente a recebe: base64, com o tipo. */
export interface IDeviceImage {
  data: string;
  mimeType: 'image/jpeg' | 'image/png';
}
