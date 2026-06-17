package setting

// Waffo Pancake hosted checkout configuration. Gateway is enabled once
// MerchantID + PrivateKey + ProductID are populated (no separate Enabled
// flag, matching Stripe / Creem). StoreID + ProductID are operator-bound
// via SaveWaffoPancakeConfig.
var (
	WaffoPancakeMerchantID string
	WaffoPancakePrivateKey string
	WaffoPancakeReturnURL  string
	WaffoPancakeUnitPrice  float64 = 1.0
	WaffoPancakeMinTopUp   int     = 1
	WaffoPancakeStoreID    string
	WaffoPancakeProductID  string

	// Checkout page knobs (kept off by default)
	WaffoPancakeEnabled          bool   = false
	WaffoPancakeWebhookPublicKey string
	WaffoPancakeSandbox          bool   = true
	WaffoPancakeWebhookTestKey   string
	WaffoPancakeCurrency         string = "USD"
	WaffoPancakeGatewayName      string
	WaffoPancakeGatewayIdentity  string
)
