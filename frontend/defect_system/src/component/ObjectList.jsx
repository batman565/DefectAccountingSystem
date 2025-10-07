import { Fragment, useEffect, useState } from "react";
import { objectsStore } from "../store/ObjectStore";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { authStore } from "../store/AuthStore";

export const ObjectList = observer(() => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newObject, setNewObject] = useState({
    name: "",
    address: "",
    type: "",
  });

  const handleObjectClick = (objectId) => {
    navigate(`/objects/${objectId}`);
  };

  const canCreateObject = !["инженер", "руководитель"].includes(
    authStore.rolename?.toLowerCase()
  );

  useEffect(() => {
    objectsStore.getobjects();
  }, []);
  const navigate = useNavigate();

  // Фильтрация объектов для поиска
  const filteredObjects = objectsStore.objects.filter(
    (obj) =>
      obj.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработчик открытия/закрытия drawer
  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Сбрасываем форму при закрытии
    setNewObject({ name: "", address: "", type: "" });
  };

  // Обработчик изменения полей формы
  const handleInputChange = (field, value) => {
    setNewObject((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Функция для создания объекта
  const handleCreateObject = async () => {
    await objectsStore.createobject(newObject);
    handleCloseDrawer();
    if (objectsStore.error) {
      alert(
        "Произошла ошибка при создании объекта. Пожалуйста, попробуйте снова."
      );
    } else {
      objectsStore.getobjects();
    }
  };

  if (objectsStore.isloading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-blue-600 mx-auto mb-3 md:mb-4"></div>
          <p className="text-blue-700 text-base md:text-lg font-medium">
            Загрузка объектов...
          </p>
        </div>
      </div>
    );
  }

  if (objectsStore.error) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-8 w-full max-w-md text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <span className="text-xl md:text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
            Произошла ошибка
          </h3>
          <p className="text-gray-600 text-sm md:text-base mb-4">
            {objectsStore.error}
          </p>
          <button
            onClick={() => objectsStore.getobjects()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-2 rounded-lg transition-colors text-sm md:text-base"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`drawer ${isDrawerOpen ? "drawer-open" : ""}`}>
      <input
        id="create-object-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        readOnly
      />

      <div className="drawer-content">
        <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Заголовок и поиск */}
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-1 md:mb-2">
                    Объекты
                  </h1>
                  <p className="text-blue-600 text-sm md:text-base">
                    Всего объектов:{" "}
                    <span className="font-semibold">
                      {filteredObjects.length}
                    </span>
                  </p>
                </div>

                {/* Поиск на мобильных и десктопе */}
                <div className="w-full sm:w-64">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Поиск объектов..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 md:py-3 bg-white border border-blue-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                    />
                    <svg
                      className="absolute left-3 top-2.5 md:top-3 w-4 h-4 md:w-5 md:h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Информация о фильтрации */}
              {searchTerm && (
                <div className="bg-blue-100 border border-blue-200 rounded-lg px-3 py-2">
                  <p className="text-blue-700 text-sm">
                    Найдено объектов:{" "}
                    <span className="font-semibold">
                      {filteredObjects.length}
                    </span>
                    {searchTerm && (
                      <span>
                        {" "}
                        по запросу "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm("")}
                          className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                        >
                          Очистить
                        </button>
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Контейнер списка */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              {/* Заголовки колонок - скрываем на мобильных */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 lg:px-6 py-3 bg-blue-50 border-b border-blue-100 text-blue-700 font-semibold text-sm">
                <div className="col-span-3">Название объекта</div>
                <div className="col-span-4">Адрес</div>
                <div className="col-span-2">Тип</div>
                <div className="col-span-2">Дата создания</div>
              </div>

              {/* Прокручиваемый список */}
              <div className="max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] overflow-y-auto">
                {filteredObjects.map((object, index) => (
                  <Fragment key={object.id}>
                    <div
                      className="block md:hidden cursor-pointer"
                      onClick={() => handleObjectClick(parseInt(object.id))}
                    >
                      <div
                        className={`p-4 border-b border-blue-50 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-blue-25"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-blue-600 font-semibold text-sm">
                                {object.name?.charAt(0).toUpperCase() || "O"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-blue-900 text-base line-clamp-2 mb-1">
                                {object.name}
                              </h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {object.type}
                              </span>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-100 ml-2 flex-shrink-0">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            </svg>
                            <span className="line-clamp-2">
                              {object.address}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(object.created_at).toLocaleDateString(
                              "ru-RU"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      key={`desktop-${object.id}`}
                      className="hidden md:grid md:grid-cols-12 gap-4 px-4 lg:px-6 py-3 border-b border-blue-50 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => handleObjectClick(parseInt(object.id))}
                    >
                      {/* Название */}
                      <div className="col-span-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-blue-600 font-semibold text-sm">
                              {object.name?.charAt(0).toUpperCase() || "O"}
                            </span>
                          </div>
                          <span className="font-medium text-blue-900 line-clamp-2 text-sm lg:text-base">
                            {object.name}
                          </span>
                        </div>
                      </div>

                      {/* Адрес */}
                      <div className="col-span-4">
                        <div className="flex items-center text-gray-600">
                          <svg
                            className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          <span className="text-sm line-clamp-2">
                            {object.address}
                          </span>
                        </div>
                      </div>

                      {/* Тип */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {object.type}
                        </span>
                      </div>

                      {/* Дата создания */}
                      <div className="col-span-2">
                        <div className="flex items-center text-gray-500 text-sm">
                          <svg
                            className="w-4 h-4 text-blue-400 mr-1 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(object.created_at).toLocaleDateString(
                            "ru-RU"
                          )}
                        </div>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>

              {/* Подвал списка */}
              {filteredObjects.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <span className="text-xl md:text-2xl">🏢</span>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-2">
                    {searchTerm ? "Объекты не найдены" : "Объекты не найдены"}
                  </h3>
                  <p className="text-blue-600 text-sm md:text-base">
                    {searchTerm
                      ? "Попробуйте изменить поисковый запрос"
                      : "Здесь появятся объекты после их добавления"}
                  </p>
                </div>
              ) : (
                <div className="px-4 md:px-6 py-2 md:py-3 bg-blue-50 border-t border-blue-100">
                  <p className="text-blue-600 text-xs md:text-sm text-center">
                    Показано {filteredObjects.length} объектов •{" "}
                    {typeof window !== "undefined" && window.innerWidth < 768
                      ? "Листайте вниз"
                      : "Используйте колесо прокрутки для навигации"}
                  </p>
                </div>
              )}
            </div>

            {/* Быстрые действия */}
            {canCreateObject && (
              <div className="mt-4 md:mt-6 flex justify-center sm:justify-end">
                <button
                  onClick={handleOpenDrawer}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors flex items-center justify-center text-sm md:text-base"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Добавить объект
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Side */}
      <div className="drawer-side !absolute z-50 h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
        <label
          htmlFor="create-object-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
          onClick={handleCloseDrawer}
        ></label>

        <div className="bg-white w-80 md:w-96 p-6 flex flex-col md:h-[calc(100vh-4rem)]">
          {/* Заголовок drawer */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-100">
            <h2 className="text-xl font-bold text-blue-900">Создать объект</h2>
            <button
              onClick={handleCloseDrawer}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Форма создания объекта */}
          <div className="flex-1 space-y-4">
            {/* Поле Название */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название объекта *
              </label>
              <input
                type="text"
                value={newObject.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите название объекта"
              />
            </div>

            {/* Поле Адрес */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес *
              </label>
              <input
                type="text"
                value={newObject.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите адрес объекта"
              />
            </div>

            {/* Поле Тип */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип объекта *
              </label>
              <select
                value={newObject.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите тип</option>
                <option value="Жилой дом">Жилой дом</option>
                <option value="Коммерческий">Коммерческий</option>
                <option value="Промышленный">Промышленный</option>
                <option value="Общественный">Общественный</option>
              </select>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="pt-6 border-t border-blue-100 space-y-3">
            <button
              onClick={handleCreateObject}
              disabled={
                !newObject.name || !newObject.address || !newObject.type
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors font-medium"
            >
              Создать объект
            </button>

            <button
              onClick={handleCloseDrawer}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition-colors font-medium"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
