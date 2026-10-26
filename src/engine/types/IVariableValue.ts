/** A project's variable with its value, unsealed in main for a run to type; it never leaves main. */
export interface IVariableValue {
  name: string;
  description: string;
  value: string;
}
