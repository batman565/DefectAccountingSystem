package services

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"fmt"
)

type CommentService struct {
	commentRepo repository.CommentRepository
}

func NewCommentService(commentRepo repository.CommentRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
	}
}

func (c *CommentService) CreateComment(text string, person_id, defect_id int) (*modules.Comment, error) {
	comment := &modules.Comment{
		Comment:   text,
		Person_id: person_id,
		Defect_id: defect_id}
	err := c.commentRepo.Create(comment)
	if err != nil {
		return nil, fmt.Errorf("create comment error: %v", err)
	}
	return comment, nil
}

func (c *CommentService) GetCommentById(id int) ([]*modules.ResponseComment, error) {
	comments, err := c.commentRepo.FindByDefectID(id)
	if err != nil {
		return nil, fmt.Errorf("get comment by id error: %v", err)
	}
	return comments, nil
}
