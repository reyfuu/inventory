package model

import (
	"testing"

	"github.com/google/uuid"
)

func TestUserBeforeCreate(t *testing.T) {
	u := User{Name: "Test User", Email: "test@example.com"}
	if err := u.BeforeCreate(nil); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if u.ID == uuid.Nil {
		t.Errorf("expected UUID to be generated, got Nil")
	}

	existingUUID := uuid.New()
	uExisting := User{ID: existingUUID, Name: "Existing User"}
	if err := uExisting.BeforeCreate(nil); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if uExisting.ID != existingUUID {
		t.Errorf("expected ID %v, got %v", existingUUID, uExisting.ID)
	}
}

func TestCategoryBeforeCreate(t *testing.T) {
	c := Category{Name: "Electronics"}
	if err := c.BeforeCreate(nil); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if c.ID == uuid.Nil {
		t.Errorf("expected UUID to be generated, got Nil")
	}
}

func TestProductBeforeCreate(t *testing.T) {
	p := Product{Name: "Laptop", SKU: "ELE-123456"}
	if err := p.BeforeCreate(nil); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if p.ID == uuid.Nil {
		t.Errorf("expected UUID to be generated, got Nil")
	}
}

func TestStockTransactionBeforeCreate(t *testing.T) {
	st := StockTransaction{Type: "IN", Quantity: 10}
	if err := st.BeforeCreate(nil); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if st.ID == uuid.Nil {
		t.Errorf("expected UUID to be generated, got Nil")
	}
}
