package main

import (
	comment "accounting-system/internal/handlers/Comment"
	defect "accounting-system/internal/handlers/Defect"
	file "accounting-system/internal/handlers/File"
	historyeditdefect "accounting-system/internal/handlers/HistoryEditDefect"
	object "accounting-system/internal/handlers/Object"
	person "accounting-system/internal/handlers/Person"
	"accounting-system/internal/repository/postgres"
	"accounting-system/internal/services"
	"accounting-system/internal/services/jwt"

	// "accounting-system/internal/services/jwt"
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	// Person
	personRepo := postgres.NewUserRepository(db)
	personService := services.NewPersonService(personRepo)
	personHandler := person.NewPersonHandler(personService)

	// Object
	objectRepo := postgres.NewObjectRepository(db)
	objectService := services.NewObjectService(objectRepo)
	objectHandler := object.NewObjectHandler(objectService)

	// Defect
	defectRepo := postgres.NewDefectRepository(db)
	defectService := services.NewDefectService(defectRepo)
	defectHandler := defect.NewDefectHandler(defectService)

	// Comment
	commentRepo := postgres.NewCommentRepository(db)
	commentService := services.NewCommentService(commentRepo)
	commentHandler := comment.NewCommentHandler(commentService)

	// File
	fileRepo := postgres.NewFileRepository(db)
	fileService := services.NewFileService(fileRepo, "/Users/mihaildremov/Desktop/Программирование/Система учета/backend/storage")
	fileHadler := file.NewFileHandler(fileService)

	//HED
	hedRepo := postgres.NewHistoryEditDefRepo(db)
	hedService := services.NewHistoryEditDefectService(hedRepo)
	hedHandler := historyeditdefect.NewHandler(hedService)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/token", personHandler.LoginPersonHandler)
	mux.HandleFunc("/api/users/create", jwt.RequireManager(personHandler.CreatePersonHandler))
	mux.HandleFunc("/api/users/update", jwt.RequireManager(personHandler.UpdatePersonHandler))
	mux.HandleFunc("/api/users/delete", jwt.RequireManager(personHandler.DeletePersonHandler))
	mux.HandleFunc("/api/users/get", jwt.RequireManagerOrEngineerOrSupervisor(personHandler.GetPersonHandler))
	mux.HandleFunc("/api/users/get/all", jwt.RequireSupervisor(personHandler.AllPersonHandler))
	mux.HandleFunc("/api/objects/create", jwt.RequireManager(objectHandler.CreateObjectHandler))
	mux.HandleFunc("/api/objects/update", jwt.RequireManager(objectHandler.UpdateObjectHandler))
	mux.HandleFunc("/api/objects/delete", jwt.RequireManager(objectHandler.DeleteObjectHandler))
	mux.HandleFunc("/api/objects/get/all", jwt.RequireManagerOrEngineerOrSupervisor(objectHandler.GetObjectsHandler))
	mux.HandleFunc("/api/defects/create", jwt.RequireEngineer(defectHandler.CreateDefectHandler))
	mux.HandleFunc("/api/defects/update", jwt.RequireManagerOrEngineer(defectHandler.UpdateDefect))
	mux.HandleFunc("/api/defects/delete", jwt.RequireManager(defectHandler.DeleteDefectHandler))
	mux.HandleFunc("/api/defects/get/all", jwt.RequireManager(defectHandler.GetAllDefectsHandler))
	mux.HandleFunc("/api/defects/get", jwt.RequireManagerOrEngineerOrSupervisor(defectHandler.GetDefectHandler))
	mux.HandleFunc("/api/defects/get/object", jwt.RequireManagerOrEngineerOrSupervisor(defectHandler.GetDefectsByObjectID))
	mux.HandleFunc("/api/defects/get/regperson", jwt.RequireManagerOrEngineer(defectHandler.GetDefectsByRegPersonID))
	mux.HandleFunc("/api/defects/get/doperson", jwt.RequireManagerOrEngineer(defectHandler.GetDefectsByDoPersonID))
	mux.HandleFunc("/api/comments/create", jwt.RequireManagerOrEngineer(commentHandler.CreateCommentHandler))
	mux.HandleFunc("/api/comments/get/defect", jwt.RequireManagerOrEngineer(commentHandler.GetCommentsHandler))
	mux.HandleFunc("/api/files/create", jwt.RequireManagerOrEngineer(fileHadler.UploadFile))
	mux.HandleFunc("/api/files/get", jwt.RequireManagerOrEngineer(fileHadler.GetFilesByDefect))
	mux.HandleFunc("/api/hed/get", jwt.RequireManagerOrEngineer(hedHandler.GetHEDByID))
	log.Fatal(http.ListenAndServe(":8080", mux))
}
