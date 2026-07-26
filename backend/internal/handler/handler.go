package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/reyfuu/inventory/backend/internal/config"
	"github.com/reyfuu/inventory/backend/internal/model"
	"github.com/reyfuu/inventory/backend/internal/service"
	"gorm.io/gorm"
)

// Categories
func GetCategories(c *gin.Context) {
	var categories []model.Category
	if err := config.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, categories)
}

func CreateCategory(c *gin.Context) {
	var category model.Category
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, category)
}

// Products
func GetProducts(c *gin.Context) {
	var products []model.Product
	if err := config.DB.Preload("Category").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, products)
}

func GetProductByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	var product model.Product
	if err := config.DB.Preload("Category").First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(http.StatusOK, product)
}

func CreateProduct(c *gin.Context) {
	var req struct {
		Name              string  `json:"name" binding:"required"`
		SKU               string  `json:"sku"`
		Description       string  `json:"description"`
		CategoryID        string  `json:"category_id" binding:"required"`
		Quantity          int     `json:"quantity"`
		PriceBuy          float64 `json:"price_buy"`
		PriceSell         float64 `json:"price_sell"`
		LowStockThreshold int     `json:"low_stock_threshold"`
		ImageURL          string  `json:"image_url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	catUUID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Category ID"})
		return
	}

	sku := req.SKU
	if sku == "" {
		var cat model.Category
		config.DB.First(&cat, catUUID)
		sku = service.GenerateSKU(cat.Name, req.Name)
	}

	product := model.Product{
		Name:              req.Name,
		SKU:               sku,
		Description:       req.Description,
		CategoryID:        catUUID,
		Quantity:          req.Quantity,
		PriceBuy:          req.PriceBuy,
		PriceSell:         req.PriceSell,
		LowStockThreshold: req.LowStockThreshold,
		ImageURL:          req.ImageURL,
	}

	if err := config.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Record initial transaction if quantity > 0
	if product.Quantity > 0 {
		transaction := model.StockTransaction{
			ProductID: product.ID,
			Type:      "IN",
			Quantity:  product.Quantity,
			Notes:     "Stok awal produk baru",
		}
		config.DB.Create(&transaction)
	}

	c.JSON(http.StatusCreated, product)
}

func UpdateProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	var product model.Product
	if err := config.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	var req struct {
		Name              string  `json:"name"`
		Description       string  `json:"description"`
		CategoryID        string  `json:"category_id"`
		PriceBuy          float64 `json:"price_buy"`
		PriceSell         float64 `json:"price_sell"`
		LowStockThreshold int     `json:"low_stock_threshold"`
		ImageURL          string  `json:"image_url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != "" {
		product.Name = req.Name
	}
	product.Description = req.Description
	product.ImageURL = req.ImageURL
	if req.CategoryID != "" {
		catUUID, err := uuid.Parse(req.CategoryID)
		if err == nil {
			product.CategoryID = catUUID
		}
	}
	if req.PriceBuy > 0 {
		product.PriceBuy = req.PriceBuy
	}
	if req.PriceSell > 0 {
		product.PriceSell = req.PriceSell
	}
	if req.LowStockThreshold >= 0 {
		product.LowStockThreshold = req.LowStockThreshold
	}

	if err := config.DB.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}

func DeleteProduct(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid UUID format"})
		return
	}

	// Delete related stock transactions first
	config.DB.Where("product_id = ?", id).Delete(&model.StockTransaction{})

	if err := config.DB.Delete(&model.Product{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product and related history deleted successfully"})
}

// Stock Transactions (In / Out)
func GetTransactions(c *gin.Context) {
	var transactions []model.StockTransaction
	if err := config.DB.Preload("Product").Preload("Product.Category").Order("created_at desc").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, transactions)
}

func CreateTransaction(c *gin.Context) {
	var req struct {
		ProductID string `json:"product_id" binding:"required"`
		Type      string `json:"type" binding:"required"` // "IN" or "OUT"
		Quantity  int    `json:"quantity" binding:"required"`
		Notes     string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	prodUUID, err := uuid.Parse(req.ProductID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Product ID"})
		return
	}

	var product model.Product
	if err := config.DB.First(&product, prodUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Update product stock quantity
	if req.Type == "IN" {
		product.Quantity += req.Quantity
	} else if req.Type == "OUT" {
		if product.Quantity < req.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
			return
		}
		product.Quantity -= req.Quantity
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction type (IN or OUT)"})
		return
	}

	tx := model.StockTransaction{
		ProductID: product.ID,
		Type:      req.Type,
		Quantity:  req.Quantity,
		Notes:     req.Notes,
	}

	err = config.DB.Transaction(func(txDB *gorm.DB) error {
		if err := txDB.Create(&tx).Error; err != nil {
			return err
		}
		if err := txDB.Save(&product).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, tx)
}

// AI suggest category & description
func SuggestProductDetails(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	desc, categoryName, err := service.GenerateDescription(req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Find category ID or suggest standard/create one
	var category model.Category
	config.DB.Where("name ILIKE ?", "%"+categoryName+"%").First(&category)
	
	categoryID := ""
	if category.ID != uuid.Nil {
		categoryID = category.ID.String()
	} else {
		// Just pick the first category as fallback or return empty ID
		var firstCat model.Category
		config.DB.First(&firstCat)
		if firstCat.ID != uuid.Nil {
			categoryID = firstCat.ID.String()
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"description":        desc,
		"suggested_category": categoryName,
		"category_id":        categoryID,
	})
}

// AI Agent Chat
func ChatWithAgent(c *gin.Context) {
	var req struct {
		History []service.ChatMessage `json:"history"`
		Message string                `json:"message" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Append user's new message to history for the API call
	allMessages := append(req.History, service.ChatMessage{
		Role:    "user",
		Content: req.Message,
	})

	reply, err := service.ChatAgent(allMessages)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"reply": reply,
	})
}
