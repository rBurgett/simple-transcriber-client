export default class Transcription {

  createdAt = '';
  text = '';
  audioUrl = '';
  postUrl = '';
  postDate = '';

  constructor(data) {
    this.createdAt = data.createdAt || this.createdAt;
    this.text = data.text || this.text;
    this.audioUrl = data.audioUrl || this.audioUrl;
    this.postUrl = data.postUrl || this.postUrl;
    this.postDate = data.postDate || this.postDate;
  }

  set(newData) {
    return new Transcription({...this, ...newData});
  }

}
