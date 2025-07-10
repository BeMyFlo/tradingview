// const apiBaseUrl = "http://localhost:8090/api/user";
apiBaseUrl = "https://beviewchart-production.up.railway.app/api/user";
// const socketUrl = "ws://localhost:8090";
const socketUrl = "wss://beviewchart-production.up.railway.app";

window.AppConfig = {
  apiBaseUrl: apiBaseUrl,
  socketUrl: socketUrl,
};
