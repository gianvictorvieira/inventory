package com.example.inventory.service;

import com.example.inventory.dto.ProductMaterialRequest;
import com.example.inventory.model.Product;
import com.example.inventory.model.ProductMaterial;
import com.example.inventory.model.RawMaterial;
import com.example.inventory.repository.ProductMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductMaterialService {

    private final ProductMaterialRepository productMaterialRepository;
    private final ProductService productService;
    private final RawMaterialService rawMaterialService;

    public ProductMaterialService(ProductMaterialRepository productMaterialRepository,
                                  ProductService productService,
                                  RawMaterialService rawMaterialService) {
        this.productMaterialRepository = productMaterialRepository;
        this.productService = productService;
        this.rawMaterialService = rawMaterialService;
    }

    public List<ProductMaterial> findByProductId(Long productId) {
        return productMaterialRepository.findByProductId(productId);
    }

    public ProductMaterial create(Long productId, ProductMaterialRequest request) {
        Product product = productService.findById(productId);
        RawMaterial rawMaterial = rawMaterialService.findById(request.rawMaterialId());

        ProductMaterial productMaterial = new ProductMaterial();
        productMaterial.setProduct(product);
        productMaterial.setRawMaterial(rawMaterial);
        productMaterial.setRequiredQuantity(request.requiredQuantity());
        return productMaterialRepository.save(productMaterial);
    }

    public ProductMaterial update(Long id, ProductMaterialRequest request) {
        ProductMaterial productMaterial = productMaterialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product material not found"));
        RawMaterial rawMaterial = rawMaterialService.findById(request.rawMaterialId());

        productMaterial.setRawMaterial(rawMaterial);
        productMaterial.setRequiredQuantity(request.requiredQuantity());
        return productMaterialRepository.save(productMaterial);
    }

    public void delete(Long id) {
        productMaterialRepository.deleteById(id);
    }
}
