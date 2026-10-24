/** A picture of the device's screen as the agent receives it: base64, with its type. */
export interface IDeviceImage {
  data: string;
  mimeType: 'image/jpeg' | 'image/png';
}
