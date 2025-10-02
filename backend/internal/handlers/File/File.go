package file

import (
	"accounting-system/internal/services"
	"encoding/json"
	"net/http"
	"strconv"
)

type FileHandler struct {
	fileService *services.FileService
}

func NewFileHandler(fileservice *services.FileService) *FileHandler {
	return &FileHandler{
		fileService: fileservice,
	}
}

func (h *FileHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseMultipartForm(512 << 20); err != nil {
		http.Error(w, "File too large", http.StatusBadRequest)
		return
	}

	defectIDStr := r.FormValue("defect_id")
	defectID, err := strconv.Atoi(defectIDStr)
	if err != nil {
		http.Error(w, "Invalid defect_id", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["files"]
	if len(files) == 0 {
		http.Error(w, "No files uploaded", http.StatusBadRequest)
		return
	}

	var result interface{}
	uploadedFiles, err := h.fileService.UploadMultipleFiles(files, defectID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	result = map[string]interface{}{"files": uploadedFiles}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(result)
}

func (h *FileHandler) GetFilesByDefect(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.Body == nil {
		http.Error(w, "No body", http.StatusBadRequest)
		return
	}

	type request struct {
		ID int `json:"id"`
	}
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	files, err := h.fileService.GetFilesByDefect(req.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"files": files})
}
