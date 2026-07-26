package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"github.com/google/uuid"
	"github.com/reyfuu/inventory/backend/internal/config"
	"github.com/reyfuu/inventory/backend/internal/model"
	"google.golang.org/api/option"
)

var (
	GeminiClient *genai.Client
	GeminiModel  *genai.GenerativeModel
	HasAPIKey    bool
)

type ChatMessage struct {
	Role    string `json:"role"`    // "user" or "model"
	Content string `json:"content"`
}

func InitGemini() {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("WARNING: GEMINI_API_KEY is not set. AI Agent features will fall back to mocked responses.")
		HasAPIKey = false
		return
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Printf("ERROR: Failed to create Gemini client: %v. Falling back to mockup.", err)
		HasAPIKey = false
		return
	}

	GeminiClient = client
	// Using gemini-1.5-flash as default model
	GeminiModel = client.GenerativeModel("gemini-1.5-flash")
	HasAPIKey = true
	log.Println("Gemini client successfully initialized.")
}

// GenerateDescription uses Gemini to create description & category based on product name
func GenerateDescription(productName string) (string, string, error) {
	if !HasAPIKey {
		return fmt.Sprintf("Deskripsi otomatis untuk %s (Hubungkan GEMINI_API_KEY Anda untuk deskripsi AI yang nyata)", productName), "Elektronik", nil
	}

	ctx := context.Background()
	prompt := fmt.Sprintf(`Berikan deskripsi singkat (maksimal 2 kalimat) dalam bahasa Indonesia untuk barang bernama "%s" dan rekomendasikan nama kategori yang cocok (misalnya: Elektronik, Pakaian, Makanan & Minuman, Peralatan Rumah Tangga). 
Kembalikan hanya dalam format JSON seperti ini: {"description": "...", "category": "..."}`, productName)

	resp, err := GeminiModel.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", "", fmt.Errorf("no response candidates from Gemini")
	}

	var jsonStr string
	for _, part := range resp.Candidates[0].Content.Parts {
		if text, ok := part.(genai.Text); ok {
			jsonStr += string(text)
		}
	}

	// Clean code blocks if returned
	if len(jsonStr) > 7 && jsonStr[:7] == "```json" {
		jsonStr = jsonStr[7:]
	}
	if len(jsonStr) > 3 && jsonStr[len(jsonStr)-3:] == "```" {
		jsonStr = jsonStr[:len(jsonStr)-3]
	}

	type Result struct {
		Description string `json:"description"`
		Category    string `json:"category"`
	}

	var result Result
	if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
		// Fallback parse
		return fmt.Sprintf("Deskripsi produk %s.", productName), "Elektronik", nil
	}

	return result.Description, result.Category, nil
}

// ChatAgent handles user query, using function calling to interact with DB
func ChatAgent(messages []ChatMessage) (string, error) {
	if !HasAPIKey {
		return "Halo! Saya adalah Inventory AI Assistant. Untuk berkomunikasi dengan data inventaris asli Anda menggunakan Gemini AI, harap konfigurasikan `GEMINI_API_KEY` terlebih dahulu di backend server.", nil
	}

	ctx := context.Background()

	// Define the tools
	tools := &genai.Tool{
		FunctionDeclarations: []*genai.FunctionDeclaration{
			{
				Name:        "get_inventory_summary",
				Description: "Dapatkan ringkasan statistik inventaris (total produk, kategori, dan estimasi total nilai aset inventaris).",
			},
			{
				Name:        "get_low_stock_products",
				Description: "Dapatkan daftar produk yang hampir habis/berada di bawah ambang batas stok minimum (low stock alert).",
			},
			{
				Name:        "search_products",
				Description: "Cari produk berdasarkan nama atau deskripsi di gudang.",
				Parameters: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"query": {
							Type:        genai.TypeString,
							Description: "Kata kunci nama barang atau deskripsi yang ingin dicari.",
						},
					},
					Required: []string{"query"},
				},
			},
		},
	}

	// Create a new model instance for this chat session to set system instruction and tools
	modelInstance := GeminiClient.GenerativeModel("gemini-1.5-flash")
	modelInstance.SystemInstruction = &genai.Content{
		Parts: []genai.Part{genai.Text("Anda adalah Asisten Inventaris AI yang cerdas. Anda membantu pengguna mengelola gudang dan stok barang mereka. Gunakan alat (tools) yang disediakan untuk mengambil data terkini dari database PostgreSQL. Jawab selalu dalam Bahasa Indonesia dengan sopan dan ringkas.")},
	}
	modelInstance.Tools = []*genai.Tool{tools}

	// Prepare history
	cs := modelInstance.StartChat()
	
	// Pre-fill chat history except the last message
	if len(messages) > 1 {
		historyParts := make([]*genai.Content, 0)
		for i := 0; i < len(messages)-1; i++ {
			historyParts = append(historyParts, &genai.Content{
				Role:  messages[i].Role,
				Parts: []genai.Part{genai.Text(messages[i].Content)},
			})
		}
		cs.History = historyParts
	}

	// Send user's latest query
	latestQuery := messages[len(messages)-1].Content
	resp, err := cs.SendMessage(ctx, genai.Text(latestQuery))
	if err != nil {
		return "", err
	}

	// Process function calls if Gemini requests them
	for {
		if len(resp.Candidates) == 0 {
			break
		}
		candidate := resp.Candidates[0]
		if len(candidate.Content.Parts) == 0 {
			break
		}

		var functionCalls []*genai.FunctionCall
		for _, part := range candidate.Content.Parts {
			if call, ok := part.(genai.FunctionCall); ok {
				functionCalls = append(functionCalls, &call)
			}
		}

		if len(functionCalls) == 0 {
			// No function call, return text response
			break
		}

		// Handle function calls
		var functionResponses []genai.Part
		for _, call := range functionCalls {
			resultData := handleToolCall(call.Name, call.Args)
			functionResponses = append(functionResponses, genai.FunctionResponse{
				Name:     call.Name,
				Response: resultData,
			})
		}

		// Send function responses back to Gemini
		resp, err = cs.SendMessage(ctx, functionResponses...)
		if err != nil {
			return "", err
		}
	}

	// Get final answer
	var botReply string
	for _, part := range resp.Candidates[0].Content.Parts {
		if text, ok := part.(genai.Text); ok {
			botReply += string(text)
		}
	}

	return botReply, nil
}

// execute DB logic based on tool call
func handleToolCall(name string, args map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})

	switch name {
	case "get_inventory_summary":
		var totalProducts int64
		var totalCategories int64
		var totalAssetValue float64

		config.DB.Model(&model.Product{}).Count(&totalProducts)
		config.DB.Model(&model.Category{}).Count(&totalCategories)
		
		var products []model.Product
		config.DB.Find(&products)
		for _, p := range products {
			totalAssetValue += float64(p.Quantity) * p.PriceBuy
		}

		result["total_products"] = totalProducts
		result["total_categories"] = totalCategories
		result["total_asset_value"] = totalAssetValue
		result["message"] = "Ringkasan data inventaris berhasil diambil."

	case "get_low_stock_products":
		var products []model.Product
		config.DB.Preload("Category").Where("quantity <= low_stock_threshold").Find(&products)
		
		list := make([]map[string]interface{}, 0)
		for _, p := range products {
			list = append(list, map[string]interface{}{
				"id":        p.ID,
				"name":      p.Name,
				"sku":       p.SKU,
				"quantity":  p.Quantity,
				"threshold": p.LowStockThreshold,
				"category":  p.Category.Name,
			})
		}
		result["products"] = list
		result["count"] = len(list)

	case "search_products":
		query, _ := args["query"].(string)
		var products []model.Product
		config.DB.Preload("Category").Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").Find(&products)

		list := make([]map[string]interface{}, 0)
		for _, p := range products {
			list = append(list, map[string]interface{}{
				"id":          p.ID,
				"name":        p.Name,
				"sku":         p.SKU,
				"quantity":    p.Quantity,
				"price_sell":  p.PriceSell,
				"category":    p.Category.Name,
				"description": p.Description,
			})
		}
		result["products"] = list
		result["query"] = query
		result["count"] = len(list)

	default:
		result["error"] = fmt.Sprintf("Tool %s tidak dikenali.", name)
	}

	return result
}

// GenerateSKU is a utility to generate SKUs for products
func GenerateSKU(categoryName string, productName string) string {
	catPrefix := "GEN"
	if len(categoryName) >= 3 {
		catPrefix = strings.ToUpper(categoryName[:3])
	}
	uuidPart := uuid.New().String()[:6]
	return fmt.Sprintf("%s-%s", catPrefix, uuidPart)
}
