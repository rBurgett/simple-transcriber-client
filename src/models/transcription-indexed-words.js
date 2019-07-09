import Joi from 'joi';
import { wrapModel } from '../util';

const TranscriptionIndexModel = ({ db }) => wrapModel(db.define('transcription-indexed-words', {
  hashKey: 'word',
  timestamps: true, // adds createdAt and updatedAt String
  schema: {
    word: Joi.string(),
    transcriptions: Joi.array().items(Joi.string())
  }
}), () => ({
  word: '',
  transcriptions: []
}));

export default TranscriptionIndexModel;
