package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/reyfuu/inventory/backend/internal/config"
	"github.com/reyfuu/inventory/backend/internal/handler"
	"github.com/reyfuu/inventory/backend/internal/service"
)

func main() {
	log.Println("Starting Inventory System Backend...")

	// Initialize DB & AI Services
	config.InitDB()
	service.InitGemini()

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	api := r.Group("/api")
	{
		// ── Public: Auth routes (no token needed) ──
		auth := api.Group("/auth")
		{
			auth.POST("/login", handler.Login)
		}

		// ── Protected: All inventory routes require valid JWT ──
		protected := api.Group("/")
		protected.Use(handler.AuthRequired())
		{
			protected.GET("/auth/me", handler.Me)

			// Categories
			protected.GET("/categories", handler.GetCategories)
			protected.POST("/categories", handler.CreateCategory)

			// Products
			protected.GET("/products", handler.GetProducts)
			protected.GET("/products/:id", handler.GetProductByID)
			protected.POST("/products", handler.CreateProduct)
			protected.PUT("/products/:id", handler.UpdateProduct)
			protected.DELETE("/products/:id", handler.DeleteProduct)

			// Stock Transactions
			protected.GET("/transactions", handler.GetTransactions)
			protected.POST("/transactions", handler.CreateTransaction)

			// AI Integration
			protected.POST("/products/ai-suggest", handler.SuggestProductDetails)
			protected.POST("/ai/chat", handler.ChatWithAgent)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Backend HTTP Server starting on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
