package modules

type ResponseDefectAll struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	Term           string `json:"term"`
	Priority       string `json:"priority"`
	Status         string `json:"status"`
	Object_id      int    `json:"object_id"`
	RegPerson_name string `json:"regperson_name"`
	RegPerson_id   int    `json:"regperson_id"`
	DoPerson_name  string `json:"doperson_name"`
	DoPerson_id    *int   `json:"doperson_id"`
	Created_at     string `json:"created_at"`
}

type ResponseComment struct {
	ID         int    `json:"id"`
	Defect_id  int    `json:"defect_id"`
	Person_id  int    `json:"person_id"`
	PersonName string `json:"personName"`
	Comment    string `json:"comment"`
	Created_at string `json:"created_at"`
}
