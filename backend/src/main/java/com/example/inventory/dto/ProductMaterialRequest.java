package com.example.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ProductMaterialRequest(
        @NotNull Long rawMaterialId,
        @NotNull @Min(1) Integer requiredQuantity
) {
}
