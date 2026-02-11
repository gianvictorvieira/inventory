package com.example.inventory.controller;

import com.example.inventory.dto.ProductMaterialRequest;
import com.example.inventory.model.ProductMaterial;
import com.example.inventory.service.ProductMaterialService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductMaterialController {

    private final ProductMaterialService productMaterialService;

    public ProductMaterialController(ProductMaterialService productMaterialService) {
        this.productMaterialService = productMaterialService;
    }

    @GetMapping("/products/{productId}/materials")
    public List<ProductMaterial> listByProduct(@PathVariable Long productId) {
        return productMaterialService.findByProductId(productId);
    }

    @PostMapping("/products/{productId}/materials")
    public ProductMaterial create(@PathVariable Long productId, @Valid @RequestBody ProductMaterialRequest request) {
        return productMaterialService.create(productId, request);
    }

    @PutMapping("/product-materials/{id}")
    public ProductMaterial update(@PathVariable Long id, @Valid @RequestBody ProductMaterialRequest request) {
        return productMaterialService.update(id, request);
    }

    @DeleteMapping("/product-materials/{id}")
    public void delete(@PathVariable Long id) {
        productMaterialService.delete(id);
    }
}
