import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { defectStore } from "../../store/DefectStore";
import { authStore } from "../../store/AuthStore";
import ExcelJS from "exceljs"; // ✅ Добавьте импорт

export const DefectDetails = observer(() => {
  const { defectId } = useParams();
  const navigate = useNavigate();

  const handleExportCSV = (defect) => {
    const data = [
      {
        "ID дефекта": defectId,
        Название: defect.name,
        Описание: defect.description,
        Статус: defect.status,
        Приоритет: defect.priority,
        Срок: new Date(defect.term).toLocaleDateString("ru-RU"),
        Зарегистрирован: defect.regperson_name,
        Исполнитель: defect.doperson_name,
      },
    ];

    const headers = Object.keys(data[0]);
    const csvContent =
      headers.join(",") +
      "\n" +
      data
        .map((row) =>
          headers.map((header) => `"${row[header] || ""}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "defect_report.csv");
    link.click();
  };

  const handleExportExcel = async (defect) => {
    const data = {
      id: defect.id,
      name: defect.name,
      description: defect.description,
      status: defect.status,
      priority: defect.priority,
      term: new Date(defect.term).toLocaleDateString("ru-RU"),
      regperson_name: defect.regperson_name,
      doperson_name: defect.doperson_name,
    };

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Дефекты");

    // Заголовки
    worksheet.columns = [
      { header: "ID дефекта", key: "id", width: 10 },
      { header: "Название", key: "name", width: 30 },
      { header: "Описание", key: "description", width: 50 },
      { header: "Статус", key: "status", width: 15 },
      { header: "Приоритет", key: "priority", width: 15 },
      { header: "Срок", key: "term", width: 15 },
      { header: "Зарегистрирован", key: "regperson_name", width: 25 },
      { header: "Исполнитель", key: "doperson_name", width: 25 },
    ];

    worksheet.addRow(data);

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "defects_report.xlsx");
    link.click();
  };

  const getStatusLabel = (id) => {
    const status = allStatuses.find((s) => s.id === parseInt(id));
    return status ? status.label : id;
  };

  const [isReady, setIsReady] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const allStatuses = [
    { id: 0, label: "Без изменений" },
    { id: 1, label: "Новая" },
    { id: 2, label: "В работе" },
    { id: 3, label: "На проверке" },
    { id: 4, label: "Закрыта" },
    { id: 5, label: "Отменена" },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsReady(false);

      if (defectId) {
        await Promise.all([
          defectStore.getengineers(),
          defectStore.getdefectbyid(defectId),
          defectStore.getcomments(defectId),
          defectStore.getPhotosDefect(defectId),
          defectStore.gethistory(defectId),
        ]);
      }

      setIsReady(true);
    };

    loadData();
  }, [defectId]);

  // === Загрузка ===
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

  // === Ошибка ===
  if (defectStore.error || !defectStore.currentDefect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ошибка</h3>
          <p className="text-gray-600 mb-4">
            {defectStore.error || "Дефект не найден"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  // === Функции ===
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Комментарий не может быть пустым");
      return;
    }

    const commentData = {
      defect_id: parseInt(defectId),
      person_id: parseInt(localStorage.getItem("id")),
      comment: newComment,
    };

    try {
      await defectStore.createcomment(commentData);
      setNewComment("");
      await defectStore.getcomments(defectId);
    } catch (err) {
      alert(
        "Ошибка при добавлении комментария: " + (err.message || "неизвестно")
      );
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      alert("Пожалуйста, выберите файлы для загрузки");
      return;
    }

    const formData = new FormData();
    formData.append("defect_id", defectId);
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      await defectStore.createphotos(formData, (progress) => {
        setUploadProgress(progress);
      });
      setSelectedFiles([]);
      setUploadProgress(0);
      await defectStore.getPhotosDefect(defectId);
    } catch (err) {
      alert("Ошибка при загрузке файлов: " + (err.message || "неизвестно"));
    }
  };

  // === Данные ===
  const defect = defectStore.currentDefect;
  const comments = defectStore.comments;
  const files = defectStore.photos;
  const history = defectStore.heds;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок и кнопка назад */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
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
              Назад
            </button>
            <h1 className="text-3xl font-bold text-blue-900">{defect.name}</h1>
          </div>

          {/* ✅ Кнопка "Экспорт" */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Экспорт
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    handleExportCSV(defect);
                    setIsExportMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Экспорт в CSV
                </button>
                <button
                  onClick={() => {
                    handleExportExcel(defect);
                    setIsExportMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Экспорт в Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Информация о дефекте */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            Информация о дефекте
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Описание:</strong> {defect.description}
              </p>
              <p>
                <strong>Приоритет:</strong> {defect.priority}
              </p>
              <p>
                <strong>Статус:</strong> {defect.status}
              </p>
              <p>
                <strong>Срок:</strong>{" "}
                {new Date(defect.term).toLocaleDateString("ru-RU")}
              </p>
            </div>
            <div>
              <p>
                <strong>Зарегистрирован:</strong> {defect.regperson_name}
              </p>
              <p>
                <strong>Исполнитель:</strong>{" "}
                {defect.doperson_name || "Не назначен"}
              </p>
              <p>
                <strong>Создан:</strong>{" "}
                {new Date(defect.created_at).toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>
        </div>

        {/* Фотографии */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Фотографии</h2>

          {/* Загрузка файлов */}
          {authStore.rolename != "Руководитель" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Загрузить фото
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              />
              <button
                onClick={handleUploadFiles}
                disabled={selectedFiles.length === 0}
                className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Загрузить
              </button>
              {uploadProgress > 0 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {/* Список фото */}
          {files && files.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <a href={file.path} target="_blank" rel="noopener noreferrer">
                    <img
                      src={file.path}
                      alt={file.filename}
                      className="w-full h-32 object-cover"
                    />
                  </a>
                  <div className="p-2 text-xs text-gray-600 truncate">
                    {file.filename}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Фотографии отсутствуют</p>
          )}
        </div>

        {/* Комментарии */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Комментарии</h2>

          {/* Форма добавления комментария */}
          {(authStore.rolename == "Менеджер" ||
            authStore.rolename == "Инженер") && (
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Написать комментарий..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Отправить
              </button>
            </div>
          )}

          {/* Список комментариев */}
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-3">
                  <div className="flex justify-between">
                    <strong>{comment.personName}</strong>
                    <span className="text-gray-500 text-sm">
                      {new Date(comment.created_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700">{comment.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Комментариев пока нет</p>
          )}
        </div>

        {/* История изменений */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            История изменений
          </h2>
          {history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>
                      {entry.changecolumn === "status_id"
                        ? "Статус"
                        : entry.changecolumn === "doperson_id"
                        ? "Исполнитель"
                        : entry.changecolumn === "term"
                        ? "Срок"
                        : entry.changecolumn === "priority"
                        ? "Приоритет"
                        : entry.changecolumn === "description"
                        ? "Описание"
                        : entry.changecolumn === "name"
                        ? "Название"
                        : ""}
                    </strong>
                  </div>
                  {entry.oldvalue != null && (
                    <div className="text-xs text-gray-500">
                      Было:{" "}
                      {entry.changecolumn === "status_id"
                        ? getStatusLabel(entry.oldvalue)
                        : entry.oldvalue}
                    </div>
                  )}
                  <div className="text-sm">
                    Стало:{" "}
                    {entry.changecolumn === "status_id"
                      ? getStatusLabel(entry.newvalue)
                      : entry.newvalue}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(entry.modified_at).toLocaleDateString("ru-RU")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              История изменений отсутствует
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
