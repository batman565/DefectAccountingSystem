package defect

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/services"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type DefectHandler struct {
	defectService *services.DefectService
}

func NewDefectHandler(defectService *services.DefectService) *DefectHandler {
	return &DefectHandler{
		defectService: defectService,
	}
}

func (d *DefectHandler) CreateDefectHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.Body == nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Body is empty"})
		return
	}
	var req modules.Defect
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	if req.Name == "" ||
		req.Description == "" ||
		req.Object_id <= 0 ||
		req.Priority == "" ||
		req.Status_id <= 0 ||
		req.RegPerson_id <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request"})
		return
	}
	if req.Term == "" {
		http.Error(w, "Term is required", http.StatusBadRequest)
		return
	}

	parsedTerm, err := time.Parse("2006-01-02", req.Term)
	if err != nil {
		http.Error(w, "Invalid date format, use YYYY-MM-DD", http.StatusBadRequest)
		return
	}

	today := time.Now().Truncate(24 * time.Hour)
	if parsedTerm.Before(today) {
		http.Error(w, "Term cannot be in the past", http.StatusBadRequest)
		return
	}
	defect, err := d.defectService.CreateDefect(req.Name,
		req.Description,
		req.Term,
		req.Priority,
		req.Object_id,
		req.Status_id,
		req.RegPerson_id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(defect)
}

func (d *DefectHandler) UpdateDefect(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.Body == nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Body is empty"})
		return
	}
	var req modules.Defect
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	if req.ID <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid id"})
		return
	}
	if req.Term != "" {
		parsedTerm, err := time.Parse("2006-01-02", req.Term)
		if err != nil {
			http.Error(w, "Invalid date format, use YYYY-MM-DD", http.StatusBadRequest)
			return
		}

		today := time.Now().Truncate(24 * time.Hour)
		if parsedTerm.Before(today) {
			http.Error(w, "Term cannot be in the past", http.StatusBadRequest)
			return
		}
	}
	defect, err := d.defectService.UpdateDefect(
		req.Name,
		req.Description,
		req.Term,
		req.Priority,
		req.Status_id,
		req.DoPerson_id,
		req.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(defect)
}

func (d *DefectHandler) DeleteDefectHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.Body == nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Body is empty"})
		return
	}
	type request struct {
		ID int `json:"id"`
	}
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	err = d.defectService.DeleteDefect(req.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": fmt.Sprintf("Defect with id %d deleted successfully", req.ID)})
}

func (d *DefectHandler) GetAllDefectsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	defects, err := d.defectService.FindAll()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string][]*modules.ResponseDefectAll{"defects": defects})
}

func (d *DefectHandler) GetDefectHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.Body == nil {
		w.WriteHeader(
			http.StatusBadRequest,
		)
		json.NewEncoder(w).Encode(map[string]string{"error": "Body is empty"})
		return
	}
	type request struct {
		ID int `json:"id"`
	}
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defect, err := d.defectService.FindByID(req.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]*modules.ResponseDefectAll{"defect": defect})
}

func (d *DefectHandler) GetDefectsByObjectID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.Body == nil {
		w.WriteHeader(
			http.StatusBadRequest,
		)
		json.NewEncoder(w).Encode(map[string]string{"error": "Body is empty"})
		return
	}
	type request struct {
		ID int `json:"id"`
	}
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defects, err := d.defectService.FindByObjectID(req.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string][]*modules.ResponseDefectAll{fmt.Sprintf("defects where ID: %d", req.ID): defects})
}

func (d *DefectHandler) GetDefectsByRegPersonID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.Body == nil {
		w.WriteHeader(
			http.StatusBadRequest,
		)
		json.NewEncoder(w).Encode(map[string]string{"error": "Body is empty"})
		return
	}
	type request struct {
		ID int `json:"id"`
	}
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defects, err := d.defectService.FindByRegPersonID(req.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string][]*modules.ResponseDefectAll{fmt.Sprintf("defects where ID: %d", req.ID): defects})
}

func (d *DefectHandler) GetDefectsByDoPersonID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.Body == nil {
		w.WriteHeader(
			http.StatusBadRequest,
		)
		json.NewEncoder(w).Encode(map[string]string{"error": "Body is empty"})
		return
	}
	type request struct {
		ID int `json:"id"`
	}
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	defects, err := d.defectService.FindByDoPersonID(req.ID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string][]*modules.ResponseDefectAll{fmt.Sprintf("defects where ID: %d", req.ID): defects})
}
