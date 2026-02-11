package com.example.inventory.controller;

import com.example.inventory.dto.ProductMaterialRequest;
import com.example.inventory.model.ProductMaterial;
import com.example.inventory.service.ProductMaterialService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductMaterialController {

    private final ProductMaterialService productMaterialService;

    public ProductMaterialController(ProductMaterialService productMaterialService) {
        this.productMaterialService = productMaterialService;
    }

    @GetMapping("/{productId}/materials")
    public List<ProductMaterial> list(@PathVariable Long productId) {
        return productMaterialService.findByProductId(productId);
    }

    // ✅ UPSERT (não duplica)
    @PostMapping("/{productId}/materials")
    public ProductMaterial upsert(@PathVariable Long productId,
                                  @Valid @RequestBody ProductMaterialRequest request) {
        return productMaterialService.upsert(productId, request);
    }

    @DeleteMapping("/materials/{id}")
    public void delete(@PathVariable Long id) {
        productMaterialService.delete(id);
    }
}
