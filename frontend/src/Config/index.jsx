//isko further change karna hoga


const { default: axios } = require("axios");

export const BASE_URL = "http://localhost:5000/api/v1/";

const clientServer = axios.create({
  baseURL: BASE_URL,
});

export default clientServer;