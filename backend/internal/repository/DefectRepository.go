package repository

import "accounting-system/internal/modules"

type DefectRepository interface {
	Create(defect *modules.Defect) error
	Update(defect *modules.Defect) error
	Delete(id int) error
	FindByID(id int) (*modules.ResponseDefectAll, error)
	FindAll() ([]*modules.ResponseDefectAll, error)
	FindByObjectID(objectid int) ([]*modules.ResponseDefectAll, error)
	FindByRegPersonID(personid int) ([]*modules.ResponseDefectAll, error)
	FindByDoPersonID(personid int) ([]*modules.ResponseDefectAll, error)
}
