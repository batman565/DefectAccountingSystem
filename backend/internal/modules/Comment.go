package modules

type Comment struct {
	ID         int    `json:"id"`
	Defect_id  int    `json:"defect_id"`
	Person_id  int    `json:"person_id"`
	Comment    string `json:"comment"`
	Created_at string `json:"created_at"`
}
