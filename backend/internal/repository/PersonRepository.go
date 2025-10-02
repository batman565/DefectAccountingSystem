package repository

import (
	. "accounting-system/internal/modules"
)

type PersonRepository interface {
	Create(person *Person) error
	Login(login, password string) (*Person, error)
	Update(person *Person) error
	Delete(id int) error
	FindById(id int) (*Person, error)
	FindAll() ([]*Person, error)
}
