class VocabularyWord {

  _id = '';
  word = '';
  model = null;

  constructor(data) {
    this._id = data._id || this._id;
    this.word = data.word || this.word;
    this.model = data.model;
  }

  set(data) {
    return new VocabularyWord({
      ...this,
      ...data
    });
  }

}

export default VocabularyWord;
