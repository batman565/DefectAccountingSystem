package services

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"fmt"
)

type DefectService struct {
	defectRepository repository.DefectRepository
}

func NewDefectService(defectRepository repository.DefectRepository) *DefectService {
	return &DefectService{
		defectRepository: defectRepository,
	}
}

func (s *DefectService) CreateDefect(name, description, term, priority string, object_id, status_id, regperson_id int) (*modules.Defect, error) {
	defect := &modules.Defect{
		Name:         name,
		Description:  description,
		Term:         term,
		Priority:     priority,
		Object_id:    object_id,
		Status_id:    status_id,
		RegPerson_id: regperson_id}
	err := s.defectRepository.Create(defect)
	if err != nil {
		return nil, err
	}
	return defect, nil
}

func (s *DefectService) UpdateDefect(name, description, term, priority string, status_id, doperson_id, id int) (*modules.Defect, error) {
	defect := &modules.Defect{
		ID:          id,
		Name:        name,
		Description: description,
		Term:        term,
		Priority:    priority,
		Status_id:   status_id,
		DoPerson_id: doperson_id}
	err := s.defectRepository.Update(defect)
	if err != nil {
		return nil, err
	}
	return defect, nil
}

func (s *DefectService) DeleteDefect(id int) error {
	if id <= 0 {
		return fmt.Errorf("invalid id")
	}
	err := s.defectRepository.Delete(id)
	if err != nil {
		return err
	}
	return nil
}

func (s *DefectService) FindAll() ([]*modules.ResponseDefectAll, error) {
	defects, err := s.defectRepository.FindAll()
	if err != nil {
		return nil, fmt.Errorf("error in find all defects: %w", err)
	}
	return defects, nil
}

func (s *DefectService) FindByID(id int) (*modules.ResponseDefectAll, error) {
	defect, err := s.defectRepository.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("error in find defect: %w", err)
	}
	return defect, nil
}

func (s *DefectService) FindByObjectID(id int) ([]*modules.ResponseDefectAll, error) {
	if id <= 0 {
		return nil, fmt.Errorf("invalid id")
	}
	defects, err := s.defectRepository.FindByObjectID(id)
	if err != nil {
		return nil, fmt.Errorf("error in find defects by object: %w", err)
	}
	return defects, nil
}

func (s *DefectService) FindByRegPersonID(id int) ([]*modules.ResponseDefectAll, error) {
	if id <= 0 {
		return nil, fmt.Errorf("invalid id")
	}
	defects, err := s.defectRepository.FindByRegPersonID(id)
	if err != nil {
		return nil, fmt.Errorf("error in find defects by object: %w", err)
	}
	return defects, nil
}

func (s *DefectService) FindByDoPersonID(id int) ([]*modules.ResponseDefectAll, error) {
	if id <= 0 {
		return nil, fmt.Errorf("invalid id")
	}
	defects, err := s.defectRepository.FindByDoPersonID(id)
	if err != nil {
		return nil, fmt.Errorf("error in find defects by object: %w", err)
	}
	return defects, nil
}
