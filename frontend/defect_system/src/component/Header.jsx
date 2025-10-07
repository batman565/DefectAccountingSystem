import { observer } from "mobx-react-lite";
import { authStore } from "../store/AuthStore";

export const Header = observer(() => {
  return (
    <>
      <div className="navbar bg-gradient-to-br from-blue-700 to-blue-300 shadow-sm flex justify-between items-center">
        <h1 className="text-white font-bold text-2xl">
          Система учета дефектов
        </h1>

        {authStore.isAuthenticated && (
          <div className="flex  flex-col space-x-4">
            <span className="text-white ">
              {authStore.firstname} {authStore.lastname}
            </span>
            <span
              onClick={authStore.logout}
              className="cursor-pointer hover:text-black text-white"
            >
              Выйти
            </span>
          </div>
        )}
      </div>
    </>
  );
});
