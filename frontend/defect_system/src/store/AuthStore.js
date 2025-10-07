// stores/AuthStore.js
import { makeAutoObservable, runInAction } from "mobx";
import { api } from "../Axios";

class AuthStore {
  id = parseInt(localStorage.getItem("id")) || 0;
  firstname = "";
  lastname = "";
  rolename = "";
  roleid = 0;
  token = localStorage.getItem("token") || "";
  isLoading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
    if (this.token) {
      this.initializeAuth();
    }
  }

  async login(username, password) {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await api.post("/api/token", {
        login: username,
        password: password,
      });
      runInAction(() => {
        const data = response.data;
        const payload = JSON.parse(
          atob(decodeURIComponent(data.token.split(".")[1]))
        );
        this.id = payload.user_id;
        this.token = `Bearer ${data.token}`;
        this.rolename = payload.role;
        localStorage.setItem("id", this.id);
        localStorage.setItem("token", this.token);
        localStorage.setItem("role", this.rolename);
        this.isLoading = false;
      });

      await this.getUser(this.id);
    } catch (error) {
      runInAction(() => {
        this.error = error.response?.data?.message || "Login failed";
        this.isLoading = false;
        this.token = "";
        localStorage.removeItem("token");
      });
      throw error;
    }
  }

  logout = () => {
    runInAction(() => {
      this.id = 0;
      this.firstname = "";
      this.lastname = "";
      this.rolename = "";
      this.roleid = 0;
      this.token = "";
      this.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      localStorage.removeItem("role");
    });

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  async getUser(id) {
    if (!this.token) return;

    try {
      const response = await api.post("/api/users/get", { id: parseInt(id) });

      runInAction(() => {
        if (response.status === 200) {
          this.firstname = response.data.firstname;
          this.lastname = response.data.lastname;
          this.rolename = response.data.role_name;
          this.roleid = response.data.role;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to load user data";
        if (error.response?.status === 401) {
          this.logout();
        }
      });
      throw error;
    }
  }

  initializeAuth = async () => {
    if (this.token) {
      try {
        await this.getUser(this.id);
      } catch (error) {
        this.logout();
      }
    }
  };

  get isAuthenticated() {
    return !!this.token;
  }

  get fullName() {
    return `${this.firstname} ${this.lastname}`.trim();
  }

  get userInfo() {
    return {
      id: this.id,
      firstname: this.firstname,
      lastname: this.lastname,
      rolename: this.rolename,
      roleid: this.roleid,
    };
  }

  clearError = () => {
    this.error = null;
  };
}

export const authStore = new AuthStore();
