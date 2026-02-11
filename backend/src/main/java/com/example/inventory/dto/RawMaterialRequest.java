package com.example.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RawMaterialRequest(
        @NotBlank String name,
        @NotNull @Min(0) Integer stockQuantity
) {
}
