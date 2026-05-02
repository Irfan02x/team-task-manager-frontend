import axios from "axios";

// 🔹 create instance
const API = axios.create({
  baseURL: "https://team-task-manager-backend-production-434d.up.railway.app/api",
  withCredentials: true
});

// 🔹 REQUEST INTERCEPTOR (attach token)
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔹 RESPONSE INTERCEPTOR (handle errors globally)
API.interceptors.response.use(
  (response) => response,

  (error) => {
    // ❌ request cancelled → ignore
    if (error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    // ❌ network error (backend down / CORS)
    if (!error.response) {
      console.log("Network error:", error.message);
      alert("Server not reachable. Check backend.");
      return Promise.reject(error);
    }

    // ❌ unauthorized → logout
    if (error.response.status === 401) {
      console.log("Unauthorized - logging out");

      localStorage.clear();
      window.location.href = "/";
    }

    // ❌ other errors
    console.log("API error:", error.response.data || error.message);

    return Promise.reject(error);
  }
);

export default API;