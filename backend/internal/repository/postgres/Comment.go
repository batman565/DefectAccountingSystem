package postgres

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"database/sql"
	"fmt"
)

type commentRepository struct {
	db *sql.DB
}

func NewCommentRepository(db *sql.DB) repository.CommentRepository {
	return &commentRepository{db: db}
}

func (r *commentRepository) Create(comment *modules.Comment) error {
	var id int64
	var createdAt string
	err := r.db.QueryRow("insert into comment (comment, defectid, personid) values ($1, $2, $3) returning id, created_at",
		comment.Comment,
		comment.Defect_id,
		comment.Person_id).Scan(&id, &createdAt)
	if err != nil {
		return fmt.Errorf("error while creating comment: %w", err)
	}
	comment.ID = int(id)
	comment.Created_at = createdAt
	return nil
}

func (r *commentRepository) FindByDefectID(id int) ([]*modules.ResponseComment, error) {
	if id > 0 {
		rows, err := r.db.Query(
			`select c.id, c.comment, c.defectid, c.personid, c.created_at, p.firstname || ' ' || p.lastname from comment c 
		join person p on c.personid = p.id 
		where defectid = $1
		order by c.created_at desc`, id)
		if err != nil {
			return nil, fmt.Errorf("error while finding comments by defect id: %w", err)
		}
		var res []*modules.ResponseComment
		for rows.Next() {
			var comment modules.ResponseComment
			err := rows.Scan(&comment.ID, &comment.Comment, &comment.Defect_id, &comment.Person_id, &comment.Created_at, &comment.PersonName)
			if err != nil {
				return nil, fmt.Errorf("error while scanning comments by defect id: %w", err)
			}
			res = append(res, &comment)
		}
		return res, nil
	}
	return nil, fmt.Errorf("error id must be > 0")
}
