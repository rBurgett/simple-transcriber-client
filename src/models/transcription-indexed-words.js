import Joi from 'joi';
import { wrapModel } from '../util';

const TranscriptionIndexModel = ({ db }) => wrapModel(db.define('transcription-indexed-words', {
  hashKey: 'word',
  rangeKey: 'transcription',
  timestamps: false, // adds createdAt and updatedAt String
  schema: {
    word: Joi.string().required(),
    transcription: Joi.string().required()
 },
  indexes: [
    {hashKey: 'transcription', rangeKey: 'word', name: 'transcription-word-index', type: 'global'}
  ]
}), () => ({
  word: '',
  transcription: ''
}));

export default TranscriptionIndexModel;
