export default class Transcription {

  createdAt = '';
  title = '';
  text = '';
  audioUrl = '';
  postUrl = '';
  postDate = '';

  constructor(data) {
    this.createdAt = data.createdAt || this.createdAt;
    this.title = data.title || this.title;
    this.text = data.text || this.text;
    this.audioUrl = data.audioUrl || this.audioUrl;
    this.postUrl = data.postUrl || this.postUrl;
    this.postDate = data.postDate || this.postDate;
  }

  set(newData) {
    return new Transcription({...this, ...newData});
  }

}
