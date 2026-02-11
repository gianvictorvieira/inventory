package com.example.inventory.service;

import com.example.inventory.dto.ProductMaterialRequest;
import com.example.inventory.model.Product;
import com.example.inventory.model.ProductMaterial;
import com.example.inventory.model.RawMaterial;
import com.example.inventory.repository.ProductMaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * ✅ UPSERT:
     * se já existe vínculo (productId + rawMaterialId) -> atualiza requiredQuantity
     * senão -> cria novo
     */
    @Transactional
    public ProductMaterial upsert(Long productId, ProductMaterialRequest request) {

        Product product = productService.findById(productId);
        RawMaterial rawMaterial = rawMaterialService.findById(request.rawMaterialId());

        return productMaterialRepository
                .findByProductIdAndRawMaterialId(productId, request.rawMaterialId())
                .map(existing -> {
                    existing.setRequiredQuantity(request.requiredQuantity());
                    return productMaterialRepository.save(existing);
                })
                .orElseGet(() -> {
                    ProductMaterial pm = new ProductMaterial();
                    pm.setProduct(product);
                    pm.setRawMaterial(rawMaterial);
                    pm.setRequiredQuantity(request.requiredQuantity());
                    return productMaterialRepository.save(pm);
                });
    }

    public void delete(Long id) {
        productMaterialRepository.deleteById(id);
    }
}
