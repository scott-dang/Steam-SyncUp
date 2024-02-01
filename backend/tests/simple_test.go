package tests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAdd(t *testing.T) {
	x := 2 + 2;
	assert.Equal(t, x, 4, "should be equal")
}