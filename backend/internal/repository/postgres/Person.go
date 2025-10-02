package postgres

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"accounting-system/internal/services/jwt"
	"database/sql"
	"fmt"
)

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) repository.PersonRepository {
	return &userRepository{
		db: db}
}

func (r *userRepository) Login(login, password string) (*modules.Person, error) {
	var person modules.Person
	err := r.db.QueryRow(`SELECT p.id, p.role_id, p.login, p.firstname, p.lastname, r.role, p.password from person p
						join role r on r.id = p.role_id
						where p.login = $1`, login).
		Scan(&person.ID, &person.Role, &person.Login, &person.Firstname, &person.Lastname, &person.RoleName, &person.Password)
	if person.ID == 0 {
		return nil, fmt.Errorf("not found user")
	}
	if err != nil {
		return nil, fmt.Errorf(`error finding user: %w`, err)
	}
	err = jwt.CheckPassword(password, person.Password)
	if err != nil {
		return nil, fmt.Errorf("error checking password: %w", err)
	}
	return &person, nil
}

func (r *userRepository) Create(user *modules.Person) error {
	var id int64
	pass, err := jwt.HashPassword(user.Password)
	if err != nil {
		return fmt.Errorf("error hashing password: %w", err)
	}
	user.Password = pass
	row := r.db.QueryRow(
		"INSERT INTO person (role_id, login, password, firstname, lastname) VALUES ($1, $2, $3, $4, $5) returning id",
		user.Role,
		user.Login,
		user.Password,
		user.Firstname,
		user.Lastname).Scan(&id)
	if row != nil {
		return fmt.Errorf("error inserting user: %w", row)
	}
	user.ID = int(id)
	return nil
}

func (r *userRepository) Update(user *modules.Person) error {
	query := "UPDATE person SET"
	args := []any{}
	argCount := 1

	if user.Role >= 1 && user.Role <= 3 {
		query += fmt.Sprintf(" role_id = $%d,", argCount)
		args = append(args, user.Role)
		argCount++
	} else if user.Role < 0 {
		return fmt.Errorf("invalid role")
	}
	if user.Login != "" {
		query += fmt.Sprintf(" login = $%d,", argCount)
		args = append(args, user.Login)
		argCount++
	}
	if user.Password != "" {
		query += fmt.Sprintf(" password = $%d,", argCount)
		pass, err := jwt.HashPassword(user.Password)
		if err != nil {
			return fmt.Errorf("error hashing password: %w", err)
		}
		args = append(args, pass)
		argCount++
	}
	if user.Firstname != "" {
		query += fmt.Sprintf(" firstname = $%d,", argCount)
		args = append(args, user.Firstname)
		argCount++
	}
	if user.Lastname != "" {
		query += fmt.Sprintf(" lastname = $%d,", argCount)
		args = append(args, user.Lastname)
		argCount++
	}

	query = query[:len(query)-1]

	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, user.ID)

	result, err := r.db.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("error updating user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error getting rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user with id %d not found", user.ID)
	}

	return nil
}

func (r *userRepository) Delete(id int) error {
	query := "DELETE FROM person WHERE id = $1"
	res, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error deleting user: %w", err)
	}
	rowaffect, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("rowaffected error")
	}
	if rowaffect == 0 {
		return fmt.Errorf("person with id %d, not found", id)
	}
	return nil
}

func (r *userRepository) FindById(id int) (*modules.Person, error) {
	if id > 0 {
		var res modules.Person
		err := r.db.QueryRow(`SELECT p.id, p.role_id, p.login, p.firstname, p.lastname, r.role
							FROM person p 
							LEFT JOIN role r ON p.role_id = r.id 
							WHERE p.id = $1`, id).Scan(&res.ID, &res.Role, &res.Login, &res.Firstname, &res.Lastname, &res.RoleName)
		if err != nil {
			return nil, fmt.Errorf("person not found with err %v", err)
		}
		return &res, nil
	}
	return nil, fmt.Errorf("invalid id")
}

func (r *userRepository) FindAll() ([]*modules.Person, error) {
	rows, err := r.db.Query(`SELECT p.id, p.role_id, p.login, p.firstname, p.lastname, r.role
							FROM person p 
							LEFT JOIN role r ON p.role_id = r.id `)
	if err != nil {
		return nil, fmt.Errorf("error getting all users: %w", err)
	}
	var res []*modules.Person
	defer rows.Close()
	for rows.Next() {
		var person modules.Person
		err := rows.Scan(&person.ID, &person.Role, &person.Login, &person.Firstname, &person.Lastname, &person.RoleName)
		if err != nil {
			return nil, fmt.Errorf("error scanning user: %w", err)
		}
		res = append(res, &person)
	}
	return res, nil
}
