package repository

import "accounting-system/internal/modules"

type CommentRepository interface {
	Create(comment *modules.Comment) error
	FindByDefectID(defectID int) ([]*modules.ResponseComment, error)
}
