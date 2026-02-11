package com.example.inventory.service;

import com.example.inventory.dto.ProductionSuggestionItem;
import com.example.inventory.dto.ProductionSuggestionResponse;
import com.example.inventory.model.Product;
import com.example.inventory.model.ProductMaterial;
import com.example.inventory.model.RawMaterial;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ProductionPlanningService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    public ProductionPlanningService(ProductRepository productRepository, RawMaterialRepository rawMaterialRepository) {
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
    }

    public ProductionSuggestionResponse suggestProduction() {
        List<Product> products = new ArrayList<>(productRepository.findAll());
        products.sort(Comparator.comparing(Product::getValue).reversed());

        Map<Long, Integer> availableStock = new HashMap<>();
        for (RawMaterial rawMaterial : rawMaterialRepository.findAll()) {
            availableStock.put(rawMaterial.getId(), rawMaterial.getStockQuantity());
        }

        List<ProductionSuggestionItem> items = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Product product : products) {
            List<ProductMaterial> billOfMaterial = product.getMaterials();
            if (billOfMaterial.isEmpty()) {
                continue;
            }

            int maxProducible = Integer.MAX_VALUE;
            for (ProductMaterial material : billOfMaterial) {
                int stock = availableStock.getOrDefault(material.getRawMaterial().getId(), 0);
                maxProducible = Math.min(maxProducible, stock / material.getRequiredQuantity());
            }

            if (maxProducible <= 0) {
                continue;
            }

            for (ProductMaterial material : billOfMaterial) {
                Long rawMaterialId = material.getRawMaterial().getId();
                int current = availableStock.getOrDefault(rawMaterialId, 0);
                int consumed = maxProducible * material.getRequiredQuantity();
                availableStock.put(rawMaterialId, current - consumed);
            }

            BigDecimal totalValue = product.getValue().multiply(BigDecimal.valueOf(maxProducible));
            grandTotal = grandTotal.add(totalValue);

            items.add(new ProductionSuggestionItem(
            product.getId(),
            product.getName(),
            maxProducible,
            totalValue   // já é BigDecimal
            ));


        }

        return new ProductionSuggestionResponse(items, grandTotal);
    }
}
