package services

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"accounting-system/internal/services/jwt"
	"fmt"
)

type PersonService struct {
	personRepository repository.PersonRepository
}

func NewPersonService(personRepo repository.PersonRepository) *PersonService {
	return &PersonService{
		personRepository: personRepo,
	}
}

func (p *PersonService) Login(login, password string) (string, error) {
	if login != "" && password != "" {
		person, err := p.personRepository.Login(login, password)
		if err != nil {
			return "", err
		}
		token, err := jwt.GenerateToken(fmt.Sprint(person.ID), person.RoleName)
		if err != nil {
			return "", fmt.Errorf("error generating token: %w", err)
		}
		return token, nil
	}
	return "", fmt.Errorf("login or password is empty")
}

func (p *PersonService) CreatePerson(role int, login, password, firstname, lastname string) (*modules.Person, error) {
	user := &modules.Person{
		Role:      role,
		Login:     login,
		Password:  password,
		Firstname: firstname,
		Lastname:  lastname,
	}
	err := p.personRepository.Create(user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (p *PersonService) UpdatePerson(id, role int, login, password, firstname, lastname string) (*modules.Person, error) {
	user := &modules.Person{
		ID:        id,
		Role:      role,
		Login:     login,
		Password:  password,
		Firstname: firstname,
		Lastname:  lastname,
	}
	err := p.personRepository.Update(user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (p *PersonService) DeletePerson(id int) error {
	err := p.personRepository.Delete(id)
	if err != nil {
		return err
	}
	return nil
}

func (p *PersonService) GetPerson(id int) (*modules.Person, error) {
	user, err := p.personRepository.FindById(id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (p *PersonService) GetPersons() ([]*modules.Person, error) {
	users, err := p.personRepository.FindAll()
	if err != nil {
		return nil, err
	} else {
		return users, nil
	}
}
