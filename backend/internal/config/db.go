package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/reyfuu/inventory/backend/internal/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using OS environment variables.")
	}
}

var DB *gorm.DB

func InitDB() {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgrespassword")
	dbname := getEnv("DB_NAME", "inventory")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Database connection established.")

	// Fix legacy constraint issue before auto-migration
	db.Exec(`DO $$ 
	BEGIN 
		IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
			IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uni_products_sku') THEN
				ALTER TABLE products ADD CONSTRAINT uni_products_sku UNIQUE (sku);
			END IF;
		END IF;
	END $$;`)

	// Auto Migration — includes User table now
	err = db.AutoMigrate(&model.User{}, &model.Category{}, &model.Product{}, &model.StockTransaction{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate database: %v", err)
	}
	log.Println("Database migration completed.")

	DB = db

	// Seed initial data
	seedAdmin()
	seedCategories()
}

// seedAdmin creates the default admin user if no users exist yet.
func seedAdmin() {
	var count int64
	DB.Model(&model.User{}).Count(&count)
	if count == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Failed to hash admin password: %v", err)
			return
		}
		admin := model.User{
			Email:    "admin@example.com",
			Name:     "Admin",
			Password: string(hash),
		}
		if result := DB.Create(&admin); result.Error != nil {
			log.Printf("Failed to seed admin user: %v", result.Error)
		} else {
			log.Println("Seeded admin user: admin@example.com / password123")
		}
	}
}

func seedCategories() {
	var count int64
	DB.Model(&model.Category{}).Count(&count)
	if count == 0 {
		categories := []model.Category{
			{Name: "Elektronik", Description: "Barang-barang elektronik seperti HP, Laptop, dan Aksesoris"},
			{Name: "Pakaian", Description: "Pakaian pria, wanita, dan anak-anak"},
			{Name: "Makanan & Minuman", Description: "Bahan makanan pokok, snack, dan minuman ringan"},
			{Name: "Peralatan Rumah Tangga", Description: "Peralatan dapur, dekorasi, dan perlengkapan rumah"},
		}
		for _, cat := range categories {
			DB.Create(&cat)
		}
		log.Println("Seeded default categories.")
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
