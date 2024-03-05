export const getApiUrl = () => {
  if (import.meta.env.MODE === "development") {
    return "http://localhost:4000";
  }
  if (import.meta.env.MODE === "test") {
    return "";
  }
  return `https://${window.location.host}/api`;
};
