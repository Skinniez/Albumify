import SpotifyWebApi from 'spotify-web-api-js';

const spotifyApi = new SpotifyWebApi();

export const setAccessToken = (token) => {
  spotifyApi.setAccessToken(token);
};

export default spotifyApi;
