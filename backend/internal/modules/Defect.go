package modules

type Defect struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Term         string `json:"term"`
	Priority     string `json:"priority"`
	Status_id    int    `json:"status_id"`
	Object_id    int    `json:"object_id"`
	RegPerson_id int    `json:"reg_person_id"`
	DoPerson_id  int    `json:"doperson_id"`
	Created_at   string `json:"created_at"`
}
