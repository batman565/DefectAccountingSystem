package services

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"fmt"
)

type HistoryEditDefectService struct {
	hEDRepository repository.HistoryEditDefRepo
}

func NewHistoryEditDefectService(hEDRepository repository.HistoryEditDefRepo) *HistoryEditDefectService {
	return &HistoryEditDefectService{
		hEDRepository: hEDRepository,
	}
}

func (h *HistoryEditDefectService) GetHistoryEditDefect(id int) ([]*modules.HistoryEditDef, error) {
	res, err := h.hEDRepository.GetHEByIdDef(id)
	if err != nil {
		return nil, fmt.Errorf("error: %v", err)
	}
	return res, nil
}
