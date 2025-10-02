package repository

import (
	. "accounting-system/internal/modules"
)

type ObjectRepository interface {
	Create(object *Object) error
	Update(object *Object) error
	Delete(id int) error
	FindAll() ([]*Object, error)
}
