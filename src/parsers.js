import yaml from 'js-yaml';
import ini from 'ini';

const extensionToParser = {
  json: JSON.parse,
  yml: yaml.safeLoad,
  ini: ini.parse,
};

export default extension => extensionToParser[extension];
