package modules

type File struct {
	ID         int    `json:"id"`
	Filename   string `json:"filename"`
	Fileweight int    `json:"fileweight"`
	Path       string `json:"path"`
	Defect_id  int    `json:"defect_id"`
	Created_at string `json:"created_at"`
}
