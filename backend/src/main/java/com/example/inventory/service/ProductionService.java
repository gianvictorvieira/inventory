package com.example.inventory.service;

import com.example.inventory.dto.ProductionSuggestionItem;
import com.example.inventory.dto.ProductionSuggestionResponse;
import com.example.inventory.model.Product;
import com.example.inventory.model.ProductMaterial;
import com.example.inventory.model.RawMaterial;
import com.example.inventory.repository.ProductMaterialRepository;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductionService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;
    private final ProductMaterialRepository productMaterialRepository;

    public ProductionService(ProductRepository productRepository,
                             RawMaterialRepository rawMaterialRepository,
                             ProductMaterialRepository productMaterialRepository) {
        this.productRepository = productRepository;
        this.rawMaterialRepository = rawMaterialRepository;
        this.productMaterialRepository = productMaterialRepository;
    }

    public ProductionSuggestionResponse suggestProduction() {

        List<Product> products = productRepository.findAll();
        List<RawMaterial> materials = rawMaterialRepository.findAll();

        // Copia do estoque para não alterar banco
        Map<Long, Integer> stockMap = materials.stream()
                .collect(Collectors.toMap(
                        RawMaterial::getId,
                        RawMaterial::getStockQuantity
                ));

        // Ordena por maior valor
        products.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        List<ProductionSuggestionItem> items = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Product product : products) {

            List<ProductMaterial> composition =
                    productMaterialRepository.findByProductId(product.getId());

            if (composition.isEmpty()) continue;

            int maxProducible = Integer.MAX_VALUE;

            for (ProductMaterial pm : composition) {
                int available = stockMap.getOrDefault(pm.getRawMaterial().getId(), 0);
                int possible = available / pm.getRequiredQuantity();
                maxProducible = Math.min(maxProducible, possible);
            }

            if (maxProducible > 0) {

                // Atualiza estoque temporário
                for (ProductMaterial pm : composition) {
                    Long materialId = pm.getRawMaterial().getId();
                    int updatedStock = stockMap.get(materialId) - (pm.getRequiredQuantity() * maxProducible);
                    stockMap.put(materialId, updatedStock);
                }

                // Calcula total como BigDecimal
                BigDecimal totalValue = product.getValue().multiply(BigDecimal.valueOf(maxProducible));
                grandTotal = grandTotal.add(totalValue);

                items.add(new ProductionSuggestionItem(
                        product.getId(),
                        product.getName(),
                        maxProducible,
                        totalValue
                ));
            }
        }

        return new ProductionSuggestionResponse(items, grandTotal);
    }
}
