import { Schema, model } from 'mongoose'

const songSchema = new Schema({
  title: String,
  artist: String,
  filePath: String,
  coverPath: String,
  duration: Number,
  uploadDate: { type: Date, default: Date.now }
});

export default model('Song', songSchema);