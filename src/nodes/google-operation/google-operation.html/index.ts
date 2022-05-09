import { EditorRED, EditorWidgetTypedInputType } from 'node-red';
import { GoogleOperationEditorNodeProperties } from './modules/types';

declare const RED: EditorRED;
const defaultTypes: Array<EditorWidgetTypedInputType> = [
  'str',
  'msg',
  'flow',
  'global',
];
const TypeConfig: Array<{
  id: string;
  types?: Array<EditorWidgetTypedInputType>;
}> = [
  { id: 'name' },
  { id: 'api' },
  { id: 'version' },
  { id: 'path' },
  { id: 'method' },
  {
    id: 'payload',
    types: ['json'],
  },
];

RED.nodes.registerType<GoogleOperationEditorNodeProperties>(
  'google-operation',
  {
    category: 'google',
    color: '#fff',
    defaults: {
      name: { value: '' },
      google: { type: 'google-credentials', required: true, value: '' },
      api: { value: '' },
      method: { value: '' },
      path: { value: '' },
      payload: { value: '' },
      version: { value: '' },
    },
    inputs: 1,
    outputs: 1,
    icon: 'google.png',
    paletteLabel: 'google operation',
    label: function () {
      return this.name || 'RAW Google Operation';
    },
    labelStyle: function () {
      return this.name ? 'node_label_italic' : '';
    },
    oneditprepare: () => {
      TypeConfig.forEach((inputType) => {
        $(`#node-input-${inputType.id}`).typedInput({
          types: inputType.types || defaultTypes,
        });
      });
    },
  }
);
