export const cleanFileName = str => str
  .replace(/\s+/g, '_')
  .replace(/[^\w\d]/g, '');

const removeEmpty = obj => Object
  .keys(obj)
  .filter(key => {
    const item = obj[key];
    return (item || item === 0 || item === false) ? true : false;
  })
  .reduce((newObj, key) => Object.assign({}, newObj, {[key]: obj[key]}), Object);

export const wrapModel = (model, defaultFunc = () => ({})) => {
  return Object.assign({}, model, {
    default: defaultFunc,
    deflate: obj => removeEmpty(obj),
    inflate: obj => Object.assign({}, defaultFunc(), obj)
  });
};

export const splitWords = str => {
  const apostrophePatt = new RegExp(`[${String.fromCharCode(8217)}']`);
  const split =  str
    .split('\n')
    .map(s => s.trim())
    .join(' ')
    .split(/\s+/)
    .filter(s => !apostrophePatt.test(s))
    .join(' ')
    .replace(/\W/g, ' ')
    .split(/\s+/)
    .map(s => s.trim())
    .filter(s => s)
    .filter(s => !/\d/.test(s))
    .filter(s => s.length > 1)
    .map(s => s.toLowerCase());
  return [...new Set(split)];
};
