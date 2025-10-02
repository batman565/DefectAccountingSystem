package jwt

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

const (
	RoleDirector     string = "Руководитель"
	RoleManager      string = "Менеджер"
	RoleEngineer     string = "Инженер"
	claimsContextKey string = "user"
)

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

type Userresponse struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
}

func GenerateToken(userID string, role string) (string, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return "", err
	}
	claims := Claims{
		UserID: userID,
		Role:   role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 24).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("SECRETKEY")))
}

func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(os.Getenv("SECRETKEY")), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("token is not valid")
}

func AuthMiddleware(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header is required", http.StatusUnauthorized)
			return
		}
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
			return
		}
		token_string := parts[1]
		claims, err := ValidateToken(token_string)
		if err != nil {
			http.Error(w, `{"error": "Invalid token`+err.Error()+`"}`, http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), claimsContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func GetClaimsFromContext(ctx context.Context) (*Claims, error) {
	claims, ok := ctx.Value(claimsContextKey).(*Claims)
	if !ok {
		return nil, fmt.Errorf("claims not found in context")
	}
	return claims, nil
}

func RequireRole(allowed_role ...string) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			claims, err := GetClaimsFromContext(r.Context())
			if err != nil {
				http.Error(w, `{"error": "Unauthorized`+err.Error()+`"}`, http.StatusUnauthorized)
				return
			}
			has := false
			for _, role := range allowed_role {
				if claims.Role == role {
					has = true
				}
			}
			if !has {
				http.Error(w, `{"error": "Access denied."}`, http.StatusForbidden)
				return
			}
			next(w, r)
		}
	}
}

func RequireManager(next http.HandlerFunc) http.HandlerFunc {
	return AuthMiddleware(RequireRole(RoleManager)(next))
}

func RequireEngineer(next http.HandlerFunc) http.HandlerFunc {
	return AuthMiddleware(RequireRole(RoleEngineer)(next))
}

func RequireSupervisor(next http.HandlerFunc) http.HandlerFunc {
	return AuthMiddleware(RequireRole(RoleDirector)(next))
}

func RequireManagerOrEngineerOrSupervisor(next http.HandlerFunc) http.HandlerFunc {
	return AuthMiddleware(RequireRole(RoleDirector, RoleManager, RoleEngineer)(next))
}

func RequireSupervisorOrManager(next http.HandlerFunc) http.HandlerFunc {
	return AuthMiddleware(RequireRole(RoleDirector, RoleManager)(next))
}

func RequireManagerOrEngineer(next http.HandlerFunc) http.HandlerFunc {
	return AuthMiddleware(RequireRole(RoleManager, RoleEngineer)(next))
}

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(hashedPassword), nil
}

func CheckPassword(password, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
