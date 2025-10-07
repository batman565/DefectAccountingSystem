import { observer } from "mobx-react-lite";
import { authStore } from "../store/AuthStore";
import { useState } from "react";
import { useNavigate } from "react-router";

export const LoginForm = observer(() => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const sendForm = async () => {
    if (login && password) {
      try {
        await authStore.login(login, password);
        navigate("/");
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex flex-col p-6 bg-gradient-to-br from-blue-500 via-blue-300 to-white rounded-lg shadow-md">
        <label className="mb-2 font-normal flex flex-col">
          Введите ваш логин
          <input
            className="input mb-4"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            type="text"
            placeholder="Логин"
          />
        </label>
        <label className="mb-2 font-medium flex flex-col">
          Введите ваш пароль
          <input
            className="input mb-6"
            value={password}
            type="password"
            placeholder="Пароль"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          onClick={sendForm}
          className="px-4 py-2 cursor-pointer text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Войти
        </button>
      </div>
    </div>
  );
});
