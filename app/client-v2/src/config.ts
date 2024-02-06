export const getApiUrl = () => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:4000';
  } else {
    return 'https://${window.location.host}/api';
  }
};
