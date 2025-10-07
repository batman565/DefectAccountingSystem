import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { defectStore } from "../../store/DefectStore";
import { authStore } from "../../store/AuthStore";

export const ObjectDetails = observer(() => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState();

  // === Состояния для редактирования ===
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [currentDefect, setCurrentDefect] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status_id: 0,
    term: "",
    priority: "Средний",
    doperson_id: null,
  });

  // === Состояния для создания ===
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    term: "",
    priority: "Средний",
    status_id: 1,
  });

  // === Состояния для фильтрации ===
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    dateFrom: "",
    dateTo: "",
  });

  const handleNavigateToDefectDetails = (defectId) => {
    if (defectId) {
      navigate(`/defects/${defectId}`);
      defectStore.currentDefect = defectStore.defects.find(
        (def) => def.id == defectId
      );
    }
  };

  useEffect(() => {
    setIsReady(false);
    const loadData = async () => {
      if (objectId) {
        await Promise.all([
          defectStore.getObjectById(objectId),
          defectStore.getDefectsByObjectId(objectId),
        ]);
      }

      if (authStore.rolename === "Менеджер") {
        try {
          await defectStore.getengineers();
        } catch (e) {
          if (e.response?.status === 403) {
            alert(
              "У вас нет прав на просмотр списка инженеров. Пожалуйста, обратитесь к администратору."
            );
          }
        }
      }
      setIsReady(true);
    };

    loadData();
    return () => {
      defectStore.clearDefects();
    };
  }, [objectId]);

  // === Фильтрация дефектов ===
  const filteredDefects = defectStore.defects.filter((defect) => {
    if (filters.status && defect.status !== filters.status) return false;
    if (filters.priority && defect.priority !== filters.priority) return false;
    if (
      filters.dateFrom &&
      new Date(defect.created_at) < new Date(filters.dateFrom)
    )
      return false;
    if (
      filters.dateTo &&
      new Date(defect.created_at) > new Date(filters.dateTo)
    )
      return false;
    return true;
  });

  const getStatusOptions = () => {
    const allStatuses = [
      { id: 0, label: "Без изменений" },
      { id: 1, label: "Новая" },
      { id: 2, label: "В работе" },
      { id: 3, label: "На проверке" },
      { id: 4, label: "Закрыта" },
      { id: 5, label: "Отменена" },
    ];

    if (authStore.rolename === "Инженер") {
      return allStatuses.filter((s) => [0, 2, 3, 4].includes(s.id));
    }
    return allStatuses;
  };

  // === Редактирование ===
  const handleSaveDefect = async () => {
    const updatedDefect = {
      id: currentDefect.id,
      name: editForm.name || undefined,
      description: editForm.description || undefined,
      term: editForm.term || undefined,
      priority: editForm.priority || undefined,
      DoPerson_id: editForm.doperson_id || undefined,
    };

    if (editForm.status_id > 0) {
      updatedDefect.status_id = editForm.status_id;
    }

    try {
      await defectStore.updateDefect(updatedDefect);
      setIsEditDrawerOpen(false);
      await defectStore.getDefectsByObjectId(objectId);
    } catch (err) {
      alert("Ошибка при сохранении: " + (err.message || "неизвестно"));
    }
  };

  const handleEditDefect = (defect) => {
    const formatDateForInput = (isoString) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      return date.toISOString().split("T")[0];
    };
    setCurrentDefect(defect);
    setEditForm({
      name: defect.name || defect.title || "",
      description: defect.description || "",
      status_id: defect.status_id || 0,
      term: formatDateForInput(defect.term) || "",
      priority: defect.priority || "Средний",
      doperson_id: defect.doperson_id || null,
    });
    setIsEditDrawerOpen(true);
  };

  // === Создание ===
  const handleCreateDefect = async () => {
    const newDefect = {
      name: createForm.name,
      description: createForm.description,
      term: createForm.term,
      priority: createForm.priority,
      status_id: createForm.status_id,
      object_id: parseInt(objectId),
      reg_person_id: parseInt(localStorage.getItem("id")),
    };

    try {
      await defectStore.createDefect(newDefect);
      setIsCreateDrawerOpen(false);
      await defectStore.getDefectsByObjectId(objectId);
      setCreateForm({
        name: "",
        description: "",
        term: "",
        priority: "Средний",
        status_id: 1,
      });
    } catch (err) {
      alert("Ошибка при создании: " + (err.message || "неизвестно"));
    }
  };

  const handleCreateClick = () => {
    setCreateForm({
      name: "",
      description: "",
      term: "",
      priority: "Средний",
      status_id: 1,
    });
    setIsCreateDrawerOpen(true);
  };

  // === Фильтрация ===
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const object = defectStore.currentObject;

  if (defectStore.isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 text-lg font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (defectStore.error || !object) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ошибка</h3>
          <p className="text-gray-600 mb-4">
            {defectStore.error || "Объект не найден"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer">
      <input
        id="edit-defect-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isEditDrawerOpen}
        onChange={() => setIsEditDrawerOpen(!isEditDrawerOpen)}
      />

      <input
        id="create-defect-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isCreateDrawerOpen}
        onChange={() => setIsCreateDrawerOpen(!isCreateDrawerOpen)}
      />

      <div className="drawer-content">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Заголовок и кнопка назад */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Назад к объектам
                </button>
                <h1 className="text-3xl font-bold text-blue-900">
                  {object.name}
                </h1>
                <p className="text-blue-600 mt-1">{object.address}</p>
              </div>
            </div>

            {/* Информация об объекте */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                Информация об объекте
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Тип:</strong> {object.type}
                  </p>
                  <p>
                    <strong>Дата создания:</strong>{" "}
                    {new Date(object.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>
            </div>

            {/* Фильтры */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Фильтры
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все</option>
                    <option value="Новая">Новая</option>
                    <option value="В работе">В работе</option>
                    <option value="На проверке">На проверке</option>
                    <option value="Закрыта">Закрыта</option>
                    <option value="Отменена">Отменена</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Приоритет
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      handleFilterChange("priority", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Все</option>
                    <option value="Низкий">Низкий</option>
                    <option value="Средний">Средний</option>
                    <option value="Высокий">Высокий</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата от
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата до
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-3 flex space-x-2">
                <button
                  onClick={clearFilters}
                  className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Сбросить
                </button>
              </div>
            </div>

            {/* Список дефектов */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-900">
                  Дефекты объекта
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Найдено: {filteredDefects.length}
                  </span>
                  {authStore.rolename === "Инженер" && (
                    <button
                      onClick={handleCreateClick}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      + Создать дефект
                    </button>
                  )}
                </div>
              </div>

              {filteredDefects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Дефекты не найдены
                  </h3>
                  <p className="text-blue-600">
                    {filters.status ||
                    filters.priority ||
                    filters.dateFrom ||
                    filters.dateTo
                      ? "Попробуйте изменить фильтры"
                      : "На этом объекте нет зарегистрированных дефектов"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDefects.map((defect) => (
                    <div
                      key={defect.id}
                      onClick={() => {
                        if (
                          authStore.rolename === "Менеджер" ||
                          authStore.rolename === "Руководитель" ||
                          (authStore.rolename === "Инженер" &&
                            (defect.doperson_id ===
                              parseInt(localStorage.getItem("id")) ||
                              defect.regperson_id ===
                                parseInt(localStorage.getItem("id"))))
                        ) {
                          handleNavigateToDefectDetails(defect.id);
                        }
                      }}
                      className={`border border-blue-100 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer ${
                        authStore.rolename === "Менеджер" ||
                        (authStore.rolename === "Инженер" &&
                          (defect.doperson_id === authStore.id ||
                            defect.regperson_id === authStore.id))
                          ? "cursor-pointer"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex flex-row">
                            <h3 className="font-semibold text-blue-900">
                              {defect.name}
                            </h3>
                            {(authStore.rolename === "Менеджер" ||
                              (authStore.rolename === "Инженер" &&
                                (defect.doperson_id ==
                                  localStorage.getItem("id") ||
                                  defect.regperson_id ==
                                    localStorage.getItem("id")))) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDefect(defect);
                                }}
                                className="text-blue-600 hover:text-blue-800 ml-2"
                                title="Редактировать"
                              >
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
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            {defect.description}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            defect.status === "Новая"
                              ? "bg-red-100 text-red-800"
                              : defect.status === "В работе"
                              ? "bg-yellow-100 text-yellow-800"
                              : defect.status === "На проверке"
                              ? "bg-blue-100 text-blue-800"
                              : defect.status === "Закрыта"
                              ? "bg-green-100 text-green-800"
                              : defect.status === "Отменена"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {defect.status === "Новая"
                            ? "Новая"
                            : defect.status === "В работе"
                            ? "В работе"
                            : defect.status === "На проверке"
                            ? "На проверке"
                            : defect.status === "Закрыта"
                            ? "Закрыта"
                            : defect.status === "Отменена"
                            ? "Отменена"
                            : defect.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                        <span>Приоритет: {defect.priority}</span>
                        <span>Зарегистрировал: {defect.regperson_name}</span>
                        <span>
                          Назначен на исполнение: {defect.doperson_name}
                        </span>
                        <span>
                          Срок:{" "}
                          {new Date(defect.term).toLocaleDateString("ru-RU")}
                        </span>
                        <span>
                          Создан:{" "}
                          {new Date(defect.created_at).toLocaleDateString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === Редактирование === */}
      {isEditDrawerOpen && (
        <div className="drawer-side !z-50 !transition-transform !duration-300 !ease-out !translate-x-0">
          <label
            htmlFor="edit-defect-drawer"
            className="drawer-overlay"
            onClick={() => setIsEditDrawerOpen(false)}
          ></label>
          <div className="bg-white w-full max-w-md p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Редактировать дефект
              </h2>
              <button
                onClick={() => setIsEditDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-700"
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

            <div className="flex-1 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Приоритет
                </label>
                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({ ...editForm, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Низкий">Низкий</option>
                  <option value="Средний">Средний</option>
                  <option value="Высокий">Высокий</option>
                </select>
              </div>
              {authStore.rolename == "Менеджер" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Срок (ГГГГ-ММ-ДД)
                  </label>
                  <input
                    type="date"
                    value={editForm.term}
                    onChange={(e) =>
                      setEditForm({ ...editForm, term: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  value={editForm.status_id}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status_id: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getStatusOptions().map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {authStore.rolename === "Менеджер" &&
                defectStore.allengineers && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Исполнитель (инженер)
                    </label>
                    <select
                      value={editForm.doperson_id || 0}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          doperson_id: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">Не назначен</option>
                      {defectStore.allengineers.map((eng) => (
                        <option key={eng.id} value={eng.id}>
                          {eng.firstname} {eng.lastname}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <button
                onClick={handleSaveDefect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Сохранить изменения
              </button>
              <button
                onClick={() => setIsEditDrawerOpen(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Создание === */}
      {isCreateDrawerOpen && (
        <div className="drawer-side !z-50 !transition-transform !duration-300 !ease-out !translate-x-0">
          <label
            htmlFor="create-defect-drawer"
            className="drawer-overlay"
            onClick={() => setIsCreateDrawerOpen(false)}
          ></label>
          <div className="bg-white w-full max-w-md p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Создать дефект
              </h2>
              <button
                onClick={() => setIsCreateDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-700"
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

            <div className="flex-1 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание *
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Приоритет
                </label>
                <select
                  value={createForm.priority}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Низкий">Низкий</option>
                  <option value="Средний">Средний</option>
                  <option value="Высокий">Высокий</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Срок (ГГГГ-ММ-ДД)
                </label>
                <input
                  type="date"
                  value={createForm.term}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, term: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  value={createForm.status_id}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      status_id: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Новая</option>
                  <option value={2}>В работе</option>
                  <option value={3}>На проверке</option>
                  <option value={4}>Закрыта</option>
                  <option value={5}>Отменена</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <button
                onClick={handleCreateDefect}
                disabled={
                  !createForm.name ||
                  !createForm.description ||
                  !createForm.term
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Создать дефект
              </button>
              <button
                onClick={() => setIsCreateDrawerOpen(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
