import objectRenderer from './object';
import plainRenderer from './plain';

const formatToRenderer = {
  object: objectRenderer,
  plain: plainRenderer,
  json: JSON.stringify,
};

export const supportedFormats = ['object', 'plain', 'json'];
export const defaultFormat = 'object';
export const getRenderer = format => formatToRenderer[format];
