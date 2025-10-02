package postgres

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"database/sql"
	"fmt"
)

type fileRepository struct {
	db *sql.DB
}

func NewFileRepository(db *sql.DB) repository.FileRepository {
	return &fileRepository{
		db: db,
	}
}

func (r *fileRepository) Create(files []*modules.File) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}
	defer tx.Rollback()

	for _, file := range files {
		err := tx.QueryRow(
			`INSERT INTO file (filename, fileweight, path, defectid) 
             VALUES ($1, $2, $3, $4)
             RETURNING id, created_at`,
			file.Filename, file.Fileweight, file.Path, file.Defect_id,
		).Scan(&file.ID, &file.Created_at)

		if err != nil {
			return fmt.Errorf("error creating file %s: %w", file.Filename, err)
		}
	}

	return tx.Commit()
}

func (r *fileRepository) Get(defectID int) ([]*modules.File, error) {
	rows, err := r.db.Query(
		`SELECT id, filename, fileweight, path, defectid, created_at 
         FROM file WHERE defectid = $1 
         ORDER BY created_at DESC`,
		defectID)
	if err != nil {
		return nil, fmt.Errorf("error getting files by defect id: %w", err)
	}
	defer rows.Close()

	var files []*modules.File
	for rows.Next() {
		var file modules.File
		err := rows.Scan(
			&file.ID,
			&file.Filename,
			&file.Fileweight,
			&file.Path,
			&file.Defect_id,
			&file.Created_at,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning file: %w", err)
		}
		files = append(files, &file)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating files: %w", err)
	}

	return files, nil
}
