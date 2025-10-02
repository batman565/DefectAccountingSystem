package postgres

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"database/sql"
	"fmt"
)

type historyEditDefRepo struct {
	db *sql.DB
}

func NewHistoryEditDefRepo(db *sql.DB) repository.HistoryEditDefRepo {
	return &historyEditDefRepo{
		db: db,
	}
}

func (r *historyEditDefRepo) GetHEByIdDef(id int) ([]*modules.HistoryEditDef, error) {
	if id > 0 {
		rows, err := r.db.Query(`select * from historyeditdefect 
								where defectid = $1
								order by modified_at desc`, id)
		if err != nil {
			return nil, fmt.Errorf("error with get history: %w", err)
		}
		var res []*modules.HistoryEditDef
		defer rows.Close()
		for rows.Next() {
			var HED modules.HistoryEditDef
			err := rows.Scan(&HED.ID, &HED.DefectID, &HED.Changecolumn, &HED.Oldvalue, &HED.Newvalue, &HED.Modified_at)
			if err != nil {
				return nil, fmt.Errorf("error with scan history: %w", err)
			}
			res = append(res, &HED)
		}
		return res, nil
	}
	return nil, fmt.Errorf("error with id")
}
