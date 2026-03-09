import axios from "axios";

export const API = axios.create({
 //baseURL: "http://localhost:5000/api",
 baseURL: "https://round-winner-api.onrender.com/api",
});