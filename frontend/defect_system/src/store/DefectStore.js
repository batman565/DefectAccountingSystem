import { makeAutoObservable, runInAction } from "mobx";
import { api } from "../Axios";

class DefectStore {
  defects = [];
  defectsbyperson = [];
  allengineers = [];
  photos = [];
  heds = [];
  comments = [];
  currentObject = null;
  currentDefect = null;
  isLoading = false;
  error = null;
  errordefect = null;

  constructor() {
    makeAutoObservable(this);
  }

  getdefectbyid = async (defectId) => {
    try {
      const response = await api.post("/api/defects/get", {
        id: parseInt(defectId),
      });
      runInAction(() => {
        this.currentDefect = response.data["defect"];
      });
    } catch (error) {
      runInAction(() => {
        this.errordefect =
          error.response?.data?.message || "Ошибка загрузки дефекта";
      });
    }
  };

  gethistory = async (defectId) => {
    try {
      const response = await api.post("/api/hed/get", {
        id: parseInt(defectId),
      });
      runInAction(() => {
        this.heds = response.data["heds"];
      });
    } catch (error) {
      runInAction(() => {
        this.errordefect = "Ошибка загрузки истории дефектов";
      });
    }
  };

  createcomment = async (comment) => {
    try {
      await api.post("/api/comments/create", comment);
    } catch (error) {
      runInAction(() => {
        this.errordefect = "Ошибка создания комментария";
      });
    }
  };

  createphotos = async (formData, onUploadProgress) => {
    try {
      await api.post("/api/files/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(progress);
          }
        },
      });
    } catch (error) {
      runInAction(() => {
        this.errordefect = "Ошибка загрузки фото";
      });
    }
  };

  getPhotosDefect = async (defectId) => {
    try {
      const response = await api.post("/api/files/get", {
        id: parseInt(defectId),
      });
      runInAction(() => {
        this.photos = response.data["files"];
      });
    } catch (error) {
      runInAction(() => {
        this.errordefect = "Ошибка загрузки фото дефекта";
      });
    }
  };

  getcomments = async (defectId) => {
    try {
      const response = await api.post("/api/comments/get/defect", {
        id: parseInt(defectId),
      });
      runInAction(() => {
        this.comments = response.data["comments"];
      });
    } catch (error) {
      runInAction(() => {
        this.errordefect = "Ошибка загрузки комментариев";
      });
    }
  };

  getDefectsByObjectId = async (objectId) => {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await api.post(`/api/defects/get/object`, {
        id: parseInt(objectId),
      });

      runInAction(() => {
        this.defects = response.data["defects"] || [];
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error =
          error.response?.data?.message || "Ошибка загрузки дефектов";
        this.isLoading = false;
      });
    }
  };

  getObjectById = async (objectId) => {
    this.isLoading = true;

    try {
      const response = await api.get(`/api/objects/get/all`);
      const object = response.data["objects"].find(
        (obj) => obj.id === parseInt(objectId)
      );
      runInAction(() => {
        this.currentObject = object;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Ошибка загрузки объекта";
        this.isLoading = false;
      });
    }
  };

  getdefectbyperson = async () => {
    try {
      const response = await api.post(`/api/defects/get/regperson`, {
        id: parseInt(localStorage.getItem("id")),
      });
      const response1 = await api.post(`/api/defects/get/doperson`, {
        id: parseInt(localStorage.getItem("id")),
      });
      runInAction(() => {
        this.defectsbyperson.push(response.data["defects"]);
        this.defectsbyperson.push(response1.data["defects"]);
      });
    } catch (error) {}
  };

  updateDefect = async (defect) => {
    try {
      await api.put(`/api/defects/update`, defect);
    } catch (error) {
      runInAction(() => {
        this.error = "Ошибка обновления дефекта";
      });
    }
  };

  createDefect = async (defect) => {
    this.isLoading = true;
    try {
      await api.post(`/api/defects/create`, defect);
      runInAction(() => {
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        alert((this.error = "Ошибка создания дефекта"));
        runInAction(() => {
          this.isLoading = false;
        });
      });
    }
  };

  getengineers = async () => {
    try {
      const response = await api.get(`/api/users/get/all`);
      runInAction(() => {
        this.allengineers = response.data["users"].filter(
          (person) => person.role_name == "Инженер"
        );
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Ошибка загрузки пользователей";
        this.isLoading = false;
      });
    }
  };

  clearDefects = () => {
    this.defects = [];
    this.currentObject = null;
    this.error = null;
  };
}

export const defectStore = new DefectStore();
