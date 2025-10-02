package repository

import "accounting-system/internal/modules"

type HistoryEditDefRepo interface {
	GetHEByIdDef(id int) ([]*modules.HistoryEditDef, error)
}
