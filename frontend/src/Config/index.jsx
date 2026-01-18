//isko further change karna hoga


const { default: axios } = require("axios");

export const BASE_URL = "https://peerfolio-rd5x.onrender.com/";

const clientServer = axios.create({
  baseURL: BASE_URL,
});

export default clientServer;