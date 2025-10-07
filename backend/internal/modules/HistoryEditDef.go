package modules

type HistoryEditDef struct {
	ID           int     `json:"id"`
	DefectID     int     `json:"defectId"`
	Changecolumn string  `json:"changecolumn"`
	Oldvalue     *string `json:"oldvalue"`
	Newvalue     *string `json:"newvalue"`
	Modified_at  string  `json:"modified_at"`
}
