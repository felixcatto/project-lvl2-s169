import _ from 'lodash';

export default (ast) => {
  const defaultPadding = '  ';
  const dataToString = (key, value, padding, modifier) => {
    if (_.isObject(value)) {
      const start = `${padding}${modifier}${key}: {\n`;
      const end = `${padding}${defaultPadding}}\n`;
      const rows = Object.keys(value).map((innerKey) => {
        const innerValue = value[innerKey];
        const innerPadding = `${padding}${defaultPadding.repeat(2)}`;
        if (_.isObject(innerValue)) {
          return dataToString(innerKey, innerValue, innerPadding, defaultPadding);
        }
        return `${innerPadding}${defaultPadding}${innerKey}: ${innerValue}\n`;
      });
      return `${start}${rows.join('')}${end}`;
    }
    return `${padding}${modifier}${key}: ${value}\n`;
  };
  const makeString = (row) => {
    const {
      key,
      type,
      newValue,
      oldValue,
      lvl,
      children,
    } = row;
    const padding = defaultPadding.repeat((lvl * 2) - 1);
    if (type === 'added') {
      return `${dataToString(key, newValue, padding, '+ ')}`;
    } else if (type === 'deleted') {
      return `${dataToString(key, oldValue, padding, '- ')}`;
    } else if (type === 'modified') {
      const oldString = dataToString(key, oldValue, padding, '- ');
      const newString = dataToString(key, newValue, padding, '+ ');
      return [oldString, newString];
    } else if (type === 'not-modified') {
      return `${dataToString(key, oldValue, padding, '  ')}`;
    } else if (type === 'nested') {
      const start = `${padding}${defaultPadding}${key}: {\n`;
      const innerRows = _.flatten(children.map(makeString)).join('');
      const end = `${padding}${defaultPadding}}\n`;
      return `${start}${innerRows}${end}`;
    }
    throw new Error('impossible case');
  };
  const rows = _.flatten(ast.map(makeString)).join('');
  return `{\n${rows}}\n`;
};
