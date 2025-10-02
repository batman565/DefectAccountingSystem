package modules

type Object struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	Address    string `json:"address"`
	Type       string `json:"type"`
	Created_at string `json:"created_at"`
}
