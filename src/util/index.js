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
