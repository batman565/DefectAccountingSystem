import { makeAutoObservable, runInAction } from "mobx";
import { api } from "../Axios";

class ObjectsStore {
  objects = [];
  isloading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }
  getobjects = async () => {
    this.isloading = true;
    try {
      const response = await api.get("/api/objects/get/all");
      runInAction(() => {
        this.objects = response.data["objects"];
        this.isloading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error;
        this.isloading = false;
      });
      console.log(error);
    }
  };
  createobject = async (object) => {
    try {
      const response = await api.post("/api/objects/create", object);
      runInAction(() => {
        this.objects.push(response.data);
      });
    } catch (error) {
      console.log(error);
    }
  };
}
export const objectsStore = new ObjectsStore();
