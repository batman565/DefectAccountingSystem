package services

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
)

type ObjectService struct {
	objectRepository repository.ObjectRepository
}

func NewObjectService(objectRepository repository.ObjectRepository) *ObjectService {
	return &ObjectService{
		objectRepository: objectRepository,
	}
}

func (o *ObjectService) CreateObject(name, address, types string) (*modules.Object, error) {
	object := &modules.Object{
		Name:    name,
		Address: address,
		Type:    types,
	}
	err := o.objectRepository.Create(object)
	if err != nil {
		return nil, err
	}
	return object, nil
}

func (o *ObjectService) UpdateObject(id int, name, address, types string) (*modules.Object, error) {
	object := &modules.Object{
		ID:      id,
		Name:    name,
		Address: address,
		Type:    types,
	}
	err := o.objectRepository.Update(object)
	if err != nil {
		return nil, err
	}
	return object, nil
}

func (o *ObjectService) DeleteObject(id int) error {
	err := o.objectRepository.Delete(id)
	if err != nil {
		return err
	}
	return nil
}

func (o *ObjectService) GetObjects() ([]*modules.Object, error) {
	objects, err := o.objectRepository.FindAll()
	if err != nil {
		return nil, err
	}
	return objects, nil
}
