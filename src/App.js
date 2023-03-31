import { useEffect, useState } from 'react';
import './App.css';
import { getLoginUrl, getAccessTokenFromUrl } from './auth';
import spotifyApi, { setAccessToken } from './spotify';
import { toPng } from 'html-to-image';
import background from './assets/background.png'

function Error({ message }) {
  return (
    <div className="error">
      <p>{message}</p>
    </div>
  );
}

const handleBackgroundLoad = () => {
  console.log('Background image loaded.');
};

function App() {
  const [userTopSongs, setUserTopSongs] = useState(null);
  const [error, setError] = useState(null);

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
      setError('Error fetching user top songs');
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
      </div>
    ));
  };

  const generatePoster = () => {
    const node = document.getElementById('songs');
    const backgroundImage = document.querySelector('.background-image');
  
    try {
      toPng(backgroundImage).then((backgroundDataUrl) => {
        toPng(node, { backgroundColor: null }).then((dataUrl) => {
          const canvas = document.createElement('canvas');
          canvas.width = 971;
          canvas.height = 1500;
          const context = canvas.getContext('2d');
  
          const background = new Image();
          background.src = backgroundDataUrl;
          background.onload = () => {
            context.drawImage(background, 0, 0, canvas.width, canvas.height);
            const poster = new Image();
            poster.src = dataUrl;
            poster.onload = () => {
              context.drawImage(poster, 0, 0, canvas.width, canvas.height);
              const downloadLink = document.createElement('a');
              downloadLink.href = canvas.toDataURL('image/png');
              downloadLink.download = 'poster.png';
              downloadLink.click();
            };
          };
        });
      });
    } catch (error) {
      console.error('Error generating poster:', error);
      setError('Error generating poster');
    }
  };
  

  return (
    <div className="App">
      {userTopSongs ? (
        <div>
          <img
            src={background}
            alt="Background"
            className="background-image"
            onLoad={handleBackgroundLoad}
          />
          <div id="songs">
            {renderTopSongs()}
          </div>
          <button onClick={generatePoster}>Generate Poster</button>
          {error && <Error message={error} />}
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
