package service

import (
	"strings"
	"testing"
)

func TestGenerateSKU(t *testing.T) {
	tests := []struct {
		category string
		product  string
		expectedPrefix string
	}{
		{"Elektronik", "Laptop Asus", "ELE"},
		{"HP", "Smartphone", "GEN"}, // short category < 3 chars defaults to GEN
		{"Pakaian", "Kaos Polos", "PAK"},
	}

	for _, tt := range tests {
		sku := GenerateSKU(tt.category, tt.product)
		if !strings.HasPrefix(sku, tt.expectedPrefix+"-") {
			t.Errorf("GenerateSKU(%q, %q) = %q; expected prefix %q-", tt.category, tt.product, sku, tt.expectedPrefix)
		}
		if len(sku) != len(tt.expectedPrefix)+1+6 {
			t.Errorf("GenerateSKU(%q, %q) = %q; unexpected length %d", tt.category, tt.product, sku, len(sku))
		}
	}
}

func TestGenerateDescriptionFallback(t *testing.T) {
	HasAPIKey = false
	desc, cat, err := GenerateDescription("Keyboard Mechanical")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(desc, "Keyboard Mechanical") {
		t.Errorf("expected description to contain product name, got %q", desc)
	}
	if cat != "Elektronik" {
		t.Errorf("expected fallback category 'Elektronik', got %q", cat)
	}
}

func TestChatAgentFallback(t *testing.T) {
	HasAPIKey = false
	messages := []ChatMessage{
		{Role: "user", Content: "Berapa stok barang saya?"},
	}

	reply, err := ChatAgent(messages)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(reply, "GEMINI_API_KEY") {
		t.Errorf("expected fallback reply warning about GEMINI_API_KEY, got %q", reply)
	}
}
