package common

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestJsonRawMessageToString(t *testing.T) {
	tests := []struct {
		name string
		data json.RawMessage
		want string
	}{
		{
			name: "object",
			data: json.RawMessage(`{"city":"Paris","days":0,"strict":false}`),
			want: `{"city":"Paris","days":0,"strict":false}`,
		},
		{
			name: "string",
			data: json.RawMessage(`"{\"city\":\"Paris\",\"days\":0,\"strict\":false}"`),
			want: `{"city":"Paris","days":0,"strict":false}`,
		},
		{
			name: "null",
			data: json.RawMessage(`null`),
			want: "",
		},
		{
			name: "empty",
			data: nil,
			want: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.Equal(t, tt.want, JsonRawMessageToString(tt.data))
		})
	}
}

// ============================================================================
// GetJsonType
// ============================================================================

func TestGetJsonType(t *testing.T) {
	tests := []struct {
		name string
		data json.RawMessage
		want string
	}{
		{
			name: "object",
			data: json.RawMessage(`{"a":1}`),
			want: "object",
		},
		{
			name: "array",
			data: json.RawMessage(`[1,2,3]`),
			want: "array",
		},
		{
			name: "string",
			data: json.RawMessage(`"hello"`),
			want: "string",
		},
		{
			name: "boolean_true",
			data: json.RawMessage(`true`),
			want: "boolean",
		},
		{
			name: "boolean_false",
			data: json.RawMessage(`false`),
			want: "boolean",
		},
		{
			name: "null",
			data: json.RawMessage(`null`),
			want: "null",
		},
		{
			name: "number_integer",
			data: json.RawMessage(`42`),
			want: "number",
		},
		{
			name: "number_float",
			data: json.RawMessage(`3.14`),
			want: "number",
		},
		{
			name: "negative_number",
			data: json.RawMessage(`-10`),
			want: "number",
		},
		{
			name: "empty",
			data: json.RawMessage(``),
			want: "unknown",
		},
		{
			name: "whitespace_only",
			data: json.RawMessage(`   `),
			want: "unknown",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.Equal(t, tt.want, GetJsonType(tt.data))
		})
	}
}

// ============================================================================
// Marshal / Unmarshal
// ============================================================================

func TestMarshalAndUnmarshal(t *testing.T) {
	type Person struct {
		Name string `json:"name"`
		Age  int    `json:"age"`
	}

	t.Run("Marshal_struct", func(t *testing.T) {
		p := Person{Name: "测试", Age: 25}
		data, err := Marshal(p)
		require.NoError(t, err)
		require.Contains(t, string(data), `"name":"测试"`)
		require.Contains(t, string(data), `"age":25`)
	})

	t.Run("Marshal_map", func(t *testing.T) {
		m := map[string]any{"key": "value", "num": 42}
		data, err := Marshal(m)
		require.NoError(t, err)
		require.Contains(t, string(data), `"key":"value"`)
	})

	t.Run("Unmarshal_to_struct", func(t *testing.T) {
		raw := []byte(`{"name":"张三","age":30}`)
		var p Person
		err := Unmarshal(raw, &p)
		require.NoError(t, err)
		require.Equal(t, "张三", p.Name)
		require.Equal(t, 30, p.Age)
	})

	t.Run("Unmarshal_to_map", func(t *testing.T) {
		raw := []byte(`{"a":1,"b":"hello"}`)
		var m map[string]any
		err := Unmarshal(raw, &m)
		require.NoError(t, err)
		require.Equal(t, float64(1), m["a"])
		require.Equal(t, "hello", m["b"])
	})

	t.Run("Unmarshal_invalid_json", func(t *testing.T) {
		var m map[string]any
		err := Unmarshal([]byte(`not json`), &m)
		require.Error(t, err)
	})

	t.Run("Marshal_nil", func(t *testing.T) {
		data, err := Marshal(nil)
		require.NoError(t, err)
		require.Equal(t, "null", string(data))
	})

	t.Run("Marshal_empty_object", func(t *testing.T) {
		data, err := Marshal(map[string]any{})
		require.NoError(t, err)
		require.Equal(t, "{}", string(data))
	})
}

// ============================================================================
// UnmarshalJsonStr
// ============================================================================

func TestUnmarshalJsonStr(t *testing.T) {
	type Item struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}

	t.Run("valid_json_string", func(t *testing.T) {
		var item Item
		err := UnmarshalJsonStr(`{"id":1,"name":"item1"}`, &item)
		require.NoError(t, err)
		require.Equal(t, 1, item.ID)
		require.Equal(t, "item1", item.Name)
	})

	t.Run("invalid_json_string", func(t *testing.T) {
		var item Item
		err := UnmarshalJsonStr(`{bad json}`, &item)
		require.Error(t, err)
	})

	t.Run("empty_string", func(t *testing.T) {
		var item Item
		err := UnmarshalJsonStr(``, &item)
		require.Error(t, err)
	})
}

// ============================================================================
// DecodeJson
// ============================================================================

func TestDecodeJson(t *testing.T) {
	type Item struct {
		Value string `json:"value"`
	}

	t.Run("decode_from_reader", func(t *testing.T) {
		body := strings.NewReader(`{"value":"test"}`)
		var item Item
		err := DecodeJson(body, &item)
		require.NoError(t, err)
		require.Equal(t, "test", item.Value)
	})

	t.Run("decode_empty_body", func(t *testing.T) {
		body := strings.NewReader(``)
		var item Item
		err := DecodeJson(body, &item)
		require.Error(t, err)
	})

	t.Run("decode_array", func(t *testing.T) {
		body := strings.NewReader(`["a","b","c"]`)
		var items []string
		err := DecodeJson(body, &items)
		require.NoError(t, err)
		require.Len(t, items, 3)
	})
}

// ============================================================================
// 往返测试 (round-trip)
// ============================================================================

func TestMarshalUnmarshalRoundTrip(t *testing.T) {
	type User struct {
		ID       int    `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email,omitempty"`
		Active   bool   `json:"active"`
	}

	t.Run("round_trip_with_email", func(t *testing.T) {
		original := User{ID: 1, Username: "alice", Email: "alice@example.com", Active: true}

		data, err := Marshal(original)
		require.NoError(t, err)

		var decoded User
		err = Unmarshal(data, &decoded)
		require.NoError(t, err)

		require.Equal(t, original, decoded)
	})

	t.Run("round_trip_omitted_field", func(t *testing.T) {
		original := User{ID: 2, Username: "bob", Active: false}

		data, err := Marshal(original)
		require.NoError(t, err)

		// omitempty should omit empty email
		require.NotContains(t, string(data), "email")

		var decoded User
		err = Unmarshal(data, &decoded)
		require.NoError(t, err)
		require.Equal(t, original, decoded)
	})
}
