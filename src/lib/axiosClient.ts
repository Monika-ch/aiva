import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://api.example.com", // replace with your backend URL when ready
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
