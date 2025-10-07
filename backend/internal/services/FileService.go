package services

import (
	"accounting-system/internal/modules"
	"accounting-system/internal/repository"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

type FileService struct {
	fileRepo  repository.FileRepository
	uploadDir string
}

func NewFileService(fileRepo repository.FileRepository, uploadDir string) *FileService {
	os.MkdirAll(uploadDir, 0755)
	return &FileService{
		fileRepo:  fileRepo,
		uploadDir: uploadDir,
	}
}

func (s *FileService) UploadMultipleFiles(fileHeaders []*multipart.FileHeader, defectID int) ([]*modules.File, error) {
	var files []*modules.File
	var savedPaths []string

	for _, fileHeader := range fileHeaders {
		filePath, err := s.saveFileToDisk(fileHeader, defectID)
		if err != nil {
			for _, path := range savedPaths {
				os.Remove(path)
			}
			return nil, fmt.Errorf("error saving file %s: %w", fileHeader.Filename, err)
		}

		files = append(files, &modules.File{
			Filename:   fileHeader.Filename,
			Fileweight: int(fileHeader.Size),
			Path:       filePath,
			Defect_id:  defectID,
		})
		savedPaths = append(savedPaths, filePath)
	}

	if err := s.fileRepo.Create(files); err != nil {
		for _, path := range savedPaths {
			os.Remove(path)
		}
		return nil, fmt.Errorf("error saving files to database: %w", err)
	}

	return files, nil
}

func (s *FileService) saveFileToDisk(fileHeader *multipart.FileHeader, defectID int) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("error opening file: %w", err)
	}
	defer file.Close()

	ext := filepath.Ext(fileHeader.Filename)
	timestamp := time.Now().UnixNano()
	uniqueName := fmt.Sprintf("%d_%d%s", defectID, timestamp, ext)
	filePath := filepath.Join(s.uploadDir, uniqueName)

	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("error creating file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("error copying file: %w", err)
	}
	publicPath := "http://localhost:8080/storage/" + uniqueName
	return publicPath, nil
}

func (s *FileService) GetFilesByDefect(defectID int) ([]*modules.File, error) {
	return s.fileRepo.Get(defectID)
}
