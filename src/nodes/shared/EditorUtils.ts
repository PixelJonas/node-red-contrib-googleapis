import { EditorWidgetTypedInputType } from 'node-red';
import { Input } from './types';


const defaultTypes: Array<EditorWidgetTypedInputType> = [
  'str',
  'msg',
  'flow',
  'global',
];

export default class EditorUtils {
  static formatInputs(inputs: Array<Input>): void {
    inputs.forEach((inputType) => {
      $(`#node-input-${inputType.id}`).typedInput({
        types: inputType.types || defaultTypes,
      });
    });
  }
}
