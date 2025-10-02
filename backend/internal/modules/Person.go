package modules

type Person struct {
	ID        int    `json:"id"`
	Role      int    `json:"role"`
	RoleName  string `json:"role_name"`
	Login     string `json:"login"`
	Password  string `json:"password"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
}
