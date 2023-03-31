const authEndpoint = 'https://accounts.spotify.com/authorize';
const clientId = 'Ya662e77c991f4b48aec24c0657c17435'; 
const redirectUri = 'http://localhost:3000'; //replace with production url when available
const scopes = [
  'user-top-read',
  'user-read-private',
];

export const getLoginUrl = () => {
    return 'http://localhost:8888/login';
  };

  export const getAccessTokenFromUrl = () => {
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((initial, item) => {
        const parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
        return initial;
      }, {});
  
    if (hash.access_token) {
      window.location.hash = ''; // Clear the hash
      return hash.access_token;
    }
  
    return null;
  };
