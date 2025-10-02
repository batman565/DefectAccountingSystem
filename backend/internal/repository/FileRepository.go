package repository

import "accounting-system/internal/modules"

type FileRepository interface {
	Create(file []*modules.File) error
	Get(defectid int) ([]*modules.File, error)
}
