import objectRenderer from './object';
import plainRenderer from './plain';

const formatToRenderer = {
  object: objectRenderer,
  plain: plainRenderer,
};

export const supportedFormats = ['object', 'plain'];
export const defaultFormat = 'object';
export const getRenderer = format => formatToRenderer[format];
