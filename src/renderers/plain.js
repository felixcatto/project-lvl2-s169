import _ from 'lodash';

export default (ast) => {
  const valueToStr = value => (_.isObject(value) ? 'complex value' : `'${value}'`);
  const makeString = (row, keyPrefix) => {
    const {
      key,
      type,
      newValue,
      oldValue,
      children,
    } = row;
    if (type === 'added') {
      const prefix = _.isObject(newValue) ? '' : 'value ';
      return `Property '${keyPrefix}${key}' was added with ${prefix}${valueToStr(newValue)}\n`;
    } else if (type === 'deleted') {
      return `Property '${keyPrefix}${key}' was removed\n`;
    } else if (type === 'modified') {
      const oldValueStr = valueToStr(oldValue);
      const newValueStr = valueToStr(newValue);
      return `Property '${keyPrefix}${key}' was updated. From ${oldValueStr} to ${newValueStr}\n`;
    } else if (type === 'not-modified') {
      return '';
    } else if (type === 'nested') {
      return children
        .map(innerRow => makeString(innerRow, `${keyPrefix}${key}.`))
        .join('');
    }
    throw new Error('impossible case');
  };
  return ast
    .map(row => makeString(row, ''))
    .join('');
};
