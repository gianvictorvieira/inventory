package com.example.inventory.dto;

import java.math.BigDecimal;

public record ProductionItemResponse(
        Long productId,
        String productName,
        int producibleQuantity,
        BigDecimal totalValue
) {}
