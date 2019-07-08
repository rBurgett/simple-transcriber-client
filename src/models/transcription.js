import Joi from 'joi';
import { wrapModel } from '../util';

const TranscriptionModel = ({ db }) => wrapModel(db.define('transcriptions', {
  hashKey: '_id',
  timestamps: true, // adds createdAt and updatedAt String
  schema: {
    _id: db.types.uuid(),
    title: Joi.string(),
    text: Joi.string(),
    audioUrl: Joi.string(),
    postUrl: Joi.string(),
    postDate: Joi.string(),
    s3Key: Joi.string(),
    s3Url: Joi.string(),
    status: Joi.string()
  }
}), () => ({
  _id: '',
  title: '',
  text: '',
  audioUrl: '',
  postUrl: '',
  postDate: '',
  s3Key: '',
  s3Url: '',
  status: ''
}));

export default TranscriptionModel;
