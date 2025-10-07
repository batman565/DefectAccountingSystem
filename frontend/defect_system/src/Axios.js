import axios from "axios";

const api = axios.create();

let navigate = null;

export const setNavigate = (navigatefunc) => {
  navigate = navigatefunc;
};
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = {
      Authorization: token,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (navigate) {
        navigate("/login", { replace: true });
      }
      return Promise.resolve({
        data: null,
        redirected: true,
      });
    }
    return Promise.reject(error);
  }
);

export { api };
