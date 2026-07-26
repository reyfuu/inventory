package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a system user that can log in.
type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Name      string    `gorm:"not null" json:"name"`
	Password  string    `gorm:"not null" json:"-"` // never expose hash
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}

type Category struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type Product struct {
	ID                 uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	SKU                string    `gorm:"uniqueIndex;not null" json:"sku"`
	Name               string    `gorm:"not null" json:"name"`
	Description        string    `json:"description"`
	CategoryID         uuid.UUID `gorm:"type:uuid;not null" json:"category_id"`
	Category           Category  `gorm:"foreignKey:CategoryID" json:"category"`
	Quantity           int       `gorm:"default:0" json:"quantity"`
	PriceBuy           float64   `gorm:"type:decimal(12,2)" json:"price_buy"`
	PriceSell          float64   `gorm:"type:decimal(12,2)" json:"price_sell"`
	LowStockThreshold  int       `gorm:"default:5" json:"low_stock_threshold"`
	ImageURL           string    `json:"image_url"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type StockTransaction struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	Product   Product   `gorm:"foreignKey:ProductID" json:"product"`
	Type      string    `gorm:"not null" json:"type"` // "IN" or "OUT"
	Quantity  int       `gorm:"not null" json:"quantity"`
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}

func (p *Product) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return
}

func (st *StockTransaction) BeforeCreate(tx *gorm.DB) (err error) {
	if st.ID == uuid.Nil {
		st.ID = uuid.New()
	}
	return
}
