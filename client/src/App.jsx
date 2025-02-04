import { useState, useEffect, useCallback, createRef } from 'react';
import './App.css';

function App() {
  // Add these state variables with the other state declarations at the top
  const [volume, setVolume] = useState(1);
  const [isRepeatOn, setIsRepeatOn] = useState(false);

  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [audio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [shuffledSongs, setShuffledSongs] = useState([]);
  const [songDurations, setSongDurations] = useState({});
  const [progressBarRef] = useState(() => createRef());

  // First, move playSong into useCallback
  const playSong = useCallback((song) => {
    if (currentSong && currentSong._id === song._id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      audio.src = `http://localhost:3001/${song.filePath}`;
      audio.play();
      setCurrentSong(song);
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying, audio]);

  const playNextSong = useCallback(() => {
    const currentList = isShuffleOn ? shuffledSongs : songs;
    const currentIndex = currentList.findIndex(song => song._id === currentSong?._id);
    const nextSong = currentList[(currentIndex + 1) % currentList.length];
    if (nextSong) playSong(nextSong);
  }, [isShuffleOn, shuffledSongs, songs, currentSong, playSong]);

  useEffect(() => {
    const handleEnded = () => {
      if (isRepeatOn) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNextSong();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeatOn, playNextSong, audio]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audio]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const handlePreviousSong = () => {
    const currentList = isShuffleOn ? shuffledSongs : songs;
    const currentIndex = currentList.findIndex(song => song._id === currentSong?._id);
    const previousIndex = currentIndex === 0 ? currentList.length - 1 : currentIndex - 1;
    const previousSong = currentList[previousIndex];
    if (previousSong) playSong(previousSong);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const toggleRepeat = () => {
    setIsRepeatOn(!isRepeatOn);
  };

  // Add this new function
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Add this new function
  const loadSongDuration = (song) => {
    const audio = new Audio(`http://localhost:3001/${song.filePath}`);
    audio.addEventListener('loadedmetadata', () => {
      setSongDurations(prev => ({
        ...prev,
        [song._id]: audio.duration
      }));
    });
  };

  // Modify the fetchSongs function
  const fetchSongs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/songs');
      const data = await response.json();
      const songs = Array.isArray(data) ? data : [];
      setSongs(songs);
      // Load durations for all songs
      songs.forEach(loadSongDuration);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setSongs([]);
    }
  };

  // Add this new function near other utility functions
  const extractMetadata = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const audioElement = new Audio(e.target.result);
        audioElement.onloadedmetadata = () => {
          resolve({
            duration: audioElement.duration,
            // You can add more metadata extraction here if needed
          });
        };
      };
      reader.readAsDataURL(file);
    });
  };

  // Update the handleUpload function
  const handleUpload = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    const fileInput = event.target.elements.song;
    const file = fileInput.files[0];
  
    try {
      const metadata = await extractMetadata(file);
      formData.append('song', file);
      formData.append('duration', metadata.duration);
  
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        fetchSongs();
        event.target.reset();
      }
    } catch (error) {
      console.error('Error uploading song:', error);
    }
  };

  const toggleShuffle = () => {
    if (!isShuffleOn) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setShuffledSongs(shuffled);
    }
    setIsShuffleOn(!isShuffleOn);
  };

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setProgress(time);
  };

  useEffect(() => {
    if (progressBarRef.current) {
      const progressPercent = (progress / duration) * 100;
      progressBarRef.current.style.setProperty('--progress-percent', `${progressPercent}%`);
    }
  }, [progress, duration]);

  // Update the song list rendering part
  return (
    <div className="app">
      <header className="header">
        <div className="logo">Rhythmix</div>
        <nav className="nav-links">
          <a href="#" className="nav-link">Songs</a>
          <a href="#" className="nav-link">Playlists</a>
        </nav>
        <input type="search" className="search-bar" placeholder="Search music..." />
      </header>

      <div className="main-content">
      <aside className="sidebar">
  
  <form onSubmit={handleUpload} className="upload-form">
    <h3>Upload Song</h3>
    <div className="form-group">
      <input
        type="file"
        name="song"
        accept="audio/*"
        required
        className="form-input"
      />
    </div>
    <button type="submit" className="btn-primary">
      Upload
    </button>
  </form>
</aside>

        <main className="songs-container">
          <div className="song-list">
            {(isShuffleOn ? shuffledSongs : songs).map((song, index) => (
              <div key={song._id} 
                   className={`song-row ${currentSong && currentSong._id === song._id && isPlaying ? 'playing' : ''}`}>
                <span className="song-number">{index + 1}</span>
                <img src={`http://localhost:3001/${song.coverPath || 'default-cover.jpg'}`} 
                     alt="" 
                     className="song-cover" />
                <div className="song-info">
                  <span className="song-title">{song.title}</span>
                  <span className="song-artist">{song.artist}</span>
                </div>
                <button
                  onClick={() => playSong(song)}
                  className="play-button"
                >
                  {currentSong && currentSong._id === song._id && isPlaying ? 'Pause' : 'Play'}
                </button>
                <span className="song-duration">
                  {songDurations[song._id] ? formatTime(songDurations[song._id]) : '--:--'}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>

      <div className="playback-bar">
        {currentSong && (
          <>
            <div className="playback-content">
              <div className="playback-info">
                <img 
                  src={`http://localhost:3001/${currentSong.coverPath || 'default-cover.jpg'}`}
                  alt=""
                  className="current-song-cover"
                />
                <div className="current-song-info">
                  <span className="current-song-title">{currentSong.title}</span>
                  <span className="current-song-artist">{currentSong.artist}</span>
                </div>
              </div>

              <div className="playback-controls">
                <button onClick={toggleShuffle} className={`control-button ${isShuffleOn ? 'active' : ''}`}>
                  🔀
                </button>
                <button onClick={handlePreviousSong} className="control-button">⏮️</button>
                <button onClick={() => playSong(currentSong)} className="control-button play-pause">
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <button onClick={playNextSong} className="control-button">⏭️</button>
                <button onClick={toggleRepeat} className={`control-button ${isRepeatOn ? 'active' : ''}`}>
                  🔁
                </button>
              </div>

              <div className="progress-container">
              <span className="time-display">{formatTime(progress)}</span>
              <input
                ref={progressBarRef}
                type="range"
                min={0}
                max={duration || 0}
                value={progress}
                onChange={handleProgressChange}
                className="progress-bar"
              />
              <span className="time-display">{formatTime(duration)}</span>
            </div>

              <div className="volume-controls">
                <span>🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
