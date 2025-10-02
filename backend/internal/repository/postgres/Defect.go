package postgres

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"database/sql"
	"fmt"
	"log"
)

type defectRepository struct {
	db *sql.DB
}

func NewDefectRepository(db *sql.DB) repository.DefectRepository {
	return &defectRepository{db: db}
}

func (r *defectRepository) Create(defect *modules.Defect) error {
	err := r.db.QueryRow(`INSERT into defect (name, object_id, status_id, description, term, priority, regperson_id, created_at) values 
	($1, $2, $3, $4, $5, $6, $7, NOW()) returning id, created_at`,
		defect.Name,
		defect.Object_id,
		defect.Status_id,
		defect.Description,
		defect.Term,
		defect.Priority,
		defect.RegPerson_id).Scan(&defect.ID, &defect.Created_at)
	if err != nil {
		return err
	}
	return nil
}

func (r *defectRepository) Update(defect *modules.Defect) error {
	query := `UPDATE defect SET`
	args := []any{}
	argcount := 1

	if defect.Name != "" {
		query += fmt.Sprintf(` name = $%d,`, argcount)
		args = append(args, defect.Name)
		argcount++
	}
	if defect.Status_id > 0 {
		query += fmt.Sprintf(` status_id = $%d,`, argcount)
		args = append(args, defect.Status_id)
		argcount++
	}
	if defect.Description != "" {
		query += fmt.Sprintf(` description = $%d,`, argcount)
		args = append(args, defect.Description)
		argcount++
	}
	if defect.Term != "" {
		query += fmt.Sprintf(` term = $%d,`, argcount)
		args = append(args, defect.Term)
		argcount++
	}
	if defect.Priority != "" {
		query += fmt.Sprintf(` priority = $%d,`, argcount)
		args = append(args, defect.Priority)
		argcount++
	}
	if defect.DoPerson_id > 0 {
		query += fmt.Sprintf(` doperson_id = $%d,`, argcount)
		args = append(args, defect.DoPerson_id)
		argcount++
	}
	query = query[:len(query)-1]
	query += fmt.Sprintf(` WHERE id = $%d 
	returning id, object_id, regperson_id, created_at`, argcount)
	args = append(args, defect.ID)
	log.Printf("query: %s", query)
	err := r.db.QueryRow(query, args...).Scan(&defect.ID, &defect.Object_id, &defect.RegPerson_id, &defect.Created_at)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("defect not found")
		}
		return fmt.Errorf("error while updating defect: %w", err)
	}
	return nil
}

func (r *defectRepository) Delete(id int) error {
	res, err := r.db.Exec(`DELETE FROM defect WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("error while deleting defect: %w", err)
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("error while deleting defect: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("defect not found")
	}
	return nil
}

func (r *defectRepository) FindAll() ([]*modules.ResponseDefectAll, error) {
	rows, err := r.db.Query(`SELECT 
    d.id, d.name, d.description, d.term, d.priority,
    s.status, d.object_id,
    CONCAT(p.firstname, ' ', p.lastname) AS regperson_name,
    p.id AS regperson_id,
    CONCAT(p1.firstname, ' ', p1.lastname) AS doperson_name,
    p1.id AS doperson_id,
    d.created_at
FROM defect d
LEFT JOIN person p ON p.id = d.regperson_id
LEFT JOIN person p1 ON p1.id = d.doperson_id
LEFT JOIN status s ON s.id = d.status_id;`)
	if err != nil {
		return nil, fmt.Errorf("error while finding defects: %w", err)
	}
	var result []*modules.ResponseDefectAll
	defer rows.Close()
	for rows.Next() {
		var defect modules.ResponseDefectAll
		err := rows.Scan(&defect.ID, &defect.Name, &defect.Description, &defect.Term,
			&defect.Priority, &defect.Status, &defect.Object_id,
			&defect.RegPerson_name, &defect.RegPerson_id,
			&defect.DoPerson_name, &defect.DoPerson_id, &defect.Created_at)
		if err != nil {
			return nil, fmt.Errorf("error while finding defects: %w", err)
		}
		result = append(result, &defect)
	}
	return result, nil
}

func (r *defectRepository) FindByID(id int) (*modules.ResponseDefectAll, error) {
	if id > 0 {
		var defect modules.ResponseDefectAll
		err := r.db.QueryRow(`SELECT 
    d.id, d.name, d.description, d.term, d.priority,
    s.status, d.object_id,
    CONCAT(p.firstname, ' ', p.lastname) AS regperson_name,
    p.id AS regperson_id,
    CONCAT(p1.firstname, ' ', p1.lastname) AS doperson_name,
    p1.id AS doperson_id,
    d.created_at
FROM defect d
LEFT JOIN person p ON p.id = d.regperson_id
LEFT JOIN person p1 ON p1.id = d.doperson_id
LEFT JOIN status s ON s.id = d.status_id
where d.id = $1;`, id).Scan(&defect.ID, &defect.Name, &defect.Description, &defect.Term,
			&defect.Priority, &defect.Status, &defect.Object_id,
			&defect.RegPerson_name, &defect.RegPerson_id,
			&defect.DoPerson_name, &defect.DoPerson_id, &defect.Created_at)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, fmt.Errorf("defect not found")
			} else {
				return nil, fmt.Errorf("error while finding defect: %w", err)
			}
		}
		return &defect, nil
	}
	return nil, nil
}

func (r *defectRepository) FindByObjectID(id int) ([]*modules.ResponseDefectAll, error) {
	if id > 0 {
		rows, err := r.db.Query(`SELECT 
    d.id, d.name, d.description, d.term, d.priority,
    s.status, d.object_id,
    CONCAT(p.firstname, ' ', p.lastname) AS regperson_name,
    p.id AS regperson_id,
    CONCAT(p1.firstname, ' ', p1.lastname) AS doperson_name,
    p1.id AS doperson_id,
    d.created_at
FROM defect d
LEFT JOIN person p ON p.id = d.regperson_id
LEFT JOIN person p1 ON p1.id = d.doperson_id
LEFT JOIN status s ON s.id = d.status_id
where d.object_id = $1;`, id)
		if err != nil {
			return nil, fmt.Errorf("error while finding defects: %w", err)
		}
		var result []*modules.ResponseDefectAll
		defer rows.Close()
		for rows.Next() {
			var defect modules.ResponseDefectAll
			err := rows.Scan(&defect.ID, &defect.Name, &defect.Description, &defect.Term,
				&defect.Priority, &defect.Status, &defect.Object_id,
				&defect.RegPerson_name, &defect.RegPerson_id,
				&defect.DoPerson_name, &defect.DoPerson_id, &defect.Created_at)
			if err != nil {
				return nil, fmt.Errorf("error while finding defects: %w", err)
			}
			result = append(result, &defect)
		}
		return result, nil
	}
	return nil, nil
}

func (r *defectRepository) FindByRegPersonID(id int) ([]*modules.ResponseDefectAll, error) {
	if id > 0 {
		rows, err := r.db.Query(`SELECT 
    d.id, d.name, d.description, d.term, d.priority,
    s.status, d.object_id,
    CONCAT(p.firstname, ' ', p.lastname) AS regperson_name,
    p.id AS regperson_id,
    CONCAT(p1.firstname, ' ', p1.lastname) AS doperson_name,
    p1.id AS doperson_id,
    d.created_at
FROM defect d
LEFT JOIN person p ON p.id = d.regperson_id
LEFT JOIN person p1 ON p1.id = d.doperson_id
LEFT JOIN status s ON s.id = d.status_id
where d.regperson_id = $1;`, id)
		if err != nil {
			return nil, fmt.Errorf("error while finding defects: %w", err)
		}
		var result []*modules.ResponseDefectAll
		defer rows.Close()
		for rows.Next() {
			var defect modules.ResponseDefectAll
			err := rows.Scan(&defect.ID, &defect.Name, &defect.Description, &defect.Term,
				&defect.Priority, &defect.Status, &defect.Object_id,
				&defect.RegPerson_name, &defect.RegPerson_id,
				&defect.DoPerson_name, &defect.DoPerson_id, &defect.Created_at)
			if err != nil {
				return nil, fmt.Errorf("error while finding defects: %w", err)
			}
			result = append(result, &defect)
		}
		return result, nil
	}
	return nil, nil
}

func (r *defectRepository) FindByDoPersonID(id int) ([]*modules.ResponseDefectAll, error) {
	if id > 0 {
		rows, err := r.db.Query(`SELECT 
    d.id, d.name, d.description, d.term, d.priority,
    s.status, d.object_id,
    CONCAT(p.firstname, ' ', p.lastname) AS regperson_name,
    p.id AS regperson_id,
    CONCAT(p1.firstname, ' ', p1.lastname) AS doperson_name,
    p1.id AS doperson_id,
    d.created_at
FROM defect d
LEFT JOIN person p ON p.id = d.regperson_id
LEFT JOIN person p1 ON p1.id = d.doperson_id
LEFT JOIN status s ON s.id = d.status_id
where d.doperson_id = $1;`, id)
		if err != nil {
			return nil, fmt.Errorf("error while finding defects: %w", err)
		}
		var result []*modules.ResponseDefectAll
		defer rows.Close()
		for rows.Next() {
			var defect modules.ResponseDefectAll
			err := rows.Scan(&defect.ID, &defect.Name, &defect.Description, &defect.Term,
				&defect.Priority, &defect.Status, &defect.Object_id,
				&defect.RegPerson_name, &defect.RegPerson_id,
				&defect.DoPerson_name, &defect.DoPerson_id, &defect.Created_at)
			if err != nil {
				return nil, fmt.Errorf("error while finding defects: %w", err)
			}
			result = append(result, &defect)
		}
		return result, nil
	}
	return nil, nil
}
