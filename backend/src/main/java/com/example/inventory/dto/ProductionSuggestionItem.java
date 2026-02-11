package com.example.inventory.dto;

import java.math.BigDecimal;

public record ProductionSuggestionItem(
        Long productId,
        String productName,
        BigDecimal productValue,
        Integer producibleQuantity,
        BigDecimal totalValue
) {
}
