import { EditorNodeProperties } from 'node-red';
import { GoogleCredentialsNode } from '../../../shared/types';
import { GoogleOperationOptions } from '../../shared/types';

export interface GoogleOperationEditorNodeProperties
  extends EditorNodeProperties,
    GoogleOperationOptions {
}
