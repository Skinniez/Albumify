import { useEffect, useState } from 'react';
import './App.css';
import { getLoginUrl, getAccessTokenFromUrl } from './auth';
import spotifyApi, { setAccessToken } from './spotify';
import htmlToImage from 'html-to-image';
import { toPng } from 'html-to-image';


function App() {
  const [userTopSongs, setUserTopSongs] = useState(null);

  useEffect(() => {
    const token = getAccessTokenFromUrl();

    if (token) {
      setAccessToken(token);
      fetchUserTopSongs();
    }
  }, []);

  const fetchUserTopSongs = async () => {
    try {
      const response = await spotifyApi.getMyTopTracks({ limit: 10 });
      setUserTopSongs(response.items);
    } catch (error) {
      console.error('Error fetching user top songs:', error);
    }
  };

  const renderTopSongs = () => {
    return userTopSongs.map((song, index) => (
      <div key={song.id} className="song">
        <div className="song-index">{index + 1}</div>
        <div className="song-info">
          <div className="song-name">{song.name}</div>
          <div className="song-artist">{song.artists[0].name}</div>
        </div>
        <img className="song-image" src={song.album.images[0]?.url} alt={song.name} />
      </div>
    ));
  };

  const generatePoster = () => {
    const node = document.getElementById('songs');
  
    toPng(node).then((dataUrl) => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'poster.png';
      link.click();
    }).catch((error) => {
      console.error('Error generating poster:', error);
    });
  };
  

  return (
    <div className="App">
      {userTopSongs ? (
        <div>
          <div id="songs">
            {renderTopSongs()}
          </div>
          <button onClick={generatePoster}>Generate Poster</button>
        </div>
      ) : (
        <a href={getLoginUrl()} className="login-button">
          Log in with Spotify
        </a>
      )}
    </div>
  );
}

export default App;
