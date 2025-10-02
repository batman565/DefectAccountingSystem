package postgres

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"database/sql"
	"fmt"
	"time"
)

type objectRepository struct {
	db *sql.DB
}

func NewObjectRepository(db *sql.DB) repository.ObjectRepository {
	return &objectRepository{
		db: db}
}

func (r *objectRepository) Create(object *modules.Object) error {
	var id int64
	var time time.Time
	row := r.db.QueryRow(
		"INSERT INTO object (name, address, type, created_at) VALUES ($1, $2, $3, NOW()) returning id, created_at",
		object.Name,
		object.Address,
		object.Type).Scan(&id, &time)
	if row != nil {
		return fmt.Errorf("error inserting user: %w", row)
	}
	object.ID = int(id)
	object.Created_at = time.String()
	return nil
}

func (r *objectRepository) Update(object *modules.Object) error {
	query := "UPDATE object SET"
	args := []any{}
	argCount := 1

	if object.Type != "" {
		query += fmt.Sprintf(" type = $%d,", argCount)
		args = append(args, object.Type)
		argCount++
	}
	if object.Name != "" {
		query += fmt.Sprintf(" name = $%d,", argCount)
		args = append(args, object.Name)
		argCount++
	}
	if object.Address != "" {
		query += fmt.Sprintf(" address = $%d,", argCount)
		args = append(args, object.Address)
		argCount++
	}

	query = query[:len(query)-1]

	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, object.ID)

	result, err := r.db.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("error updating object: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error getting rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("object with id %d not found", object.ID)
	}

	return nil
}

func (r *objectRepository) Delete(id int) error {
	query := "DELETE FROM object WHERE id = $1"
	res, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error deleting object: %w", err)
	}
	rowaffect, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("rowaffected error")
	}
	if rowaffect == 0 {
		return fmt.Errorf("object with id %d, not found", id)
	}
	return nil
}

func (r *objectRepository) FindAll() ([]*modules.Object, error) {
	rows, err := r.db.Query("SELECT * FROM object")
	if err != nil {
		return nil, fmt.Errorf("error getting all object: %w", err)
	}
	var res []*modules.Object
	defer rows.Close()
	for rows.Next() {
		var object modules.Object
		err := rows.Scan(&object.ID, &object.Name, &object.Address, &object.Type, &object.Created_at)
		if err != nil {
			return nil, fmt.Errorf("error scanning object: %w", err)
		}
		res = append(res, &object)
	}
	return res, nil
}
