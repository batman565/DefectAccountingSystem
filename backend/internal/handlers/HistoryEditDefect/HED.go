package historyeditdefect

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/services"
	"encoding/json"
	"fmt"
	"net/http"
)

type hEDHandler struct {
	hEDService *services.HistoryEditDefectService
}

func NewHandler(hEDService *services.HistoryEditDefectService) *hEDHandler {
	return &hEDHandler{
		hEDService: hEDService,
	}
}

func (h *hEDHandler) GetHEDByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
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
	hed, err := h.hEDService.GetHistoryEditDefect(req.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string][]*modules.HistoryEditDef{fmt.Sprintf("HED by ID: %d", req.ID): hed})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
