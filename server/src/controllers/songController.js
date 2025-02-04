import * as musicMetadata from 'music-metadata';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Song from '../models/Song.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadSong = async (req, res) => {
  try {
    const { file } = req;
    const metadata = await musicMetadata.parseFile(file.path);
    let coverPath = null;

    // Extract title and artist from metadata
    const title = metadata.common.title || file.originalname.replace(/\.[^/.]+$/, '');
    const artist = metadata.common.artist || 'Unknown Artist';

    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      const coverFileName = `cover-${Date.now()}.${picture.format.split('/')[1]}`;
      const coverFilePath = path.join(__dirname, '../../uploads', coverFileName);
      
      await fs.writeFile(coverFilePath, picture.data);
      coverPath = coverFileName;
    }

    const song = new Song({
      title,
      artist,
      filePath: `uploads/${file.filename}`,
      coverPath: coverPath ? `uploads/${coverPath}` : null,
      duration: metadata.format.duration
    });

    await song.save();
    res.status(201).json(song);
  } catch (error) {
    console.error('Error uploading song:', error);
    res.status(500).json({ message: 'Error uploading song' });
  }
};

export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching songs' });
  }
};