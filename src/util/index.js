export const cleanFileName = str => str
  .replace(/\s+/g, '_')
  .replace(/[^\w\d]/g, '');
