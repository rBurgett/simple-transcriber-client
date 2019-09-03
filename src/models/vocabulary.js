import Joi from 'joi';
import { wrapModel } from '../util';

const VocabularyModel = ({ db }) => wrapModel(db.define('vocabulary', {
  hashKey: '_id',
  timestamps: true, // adds createdAt and updatedAt String
  schema: {
    _id: db.types.uuid(),
    word: Joi.string().required()
  }
}), () => ({
  _id: '',
  word: ''
}));

export default VocabularyModel;
