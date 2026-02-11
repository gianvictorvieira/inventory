package com.example.inventory.service;

import com.example.inventory.dto.ProductionSuggestionResponse;
import com.example.inventory.model.Product;
import com.example.inventory.model.ProductMaterial;
import com.example.inventory.model.RawMaterial;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.RawMaterialRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProductionPlanningServiceTest {

    @Test
    void shouldPrioritizeHigherValueProducts() {
        ProductRepository productRepository = mock(ProductRepository.class);
        RawMaterialRepository rawMaterialRepository = mock(RawMaterialRepository.class);

        RawMaterial steel = new RawMaterial();
        steel.setId(1L);
        steel.setName("Steel");
        steel.setStockQuantity(10);

        Product highValue = new Product();
        highValue.setId(1L);
        highValue.setName("Premium Item");
        highValue.setValue(new BigDecimal("100.00"));

        Product lowValue = new Product();
        lowValue.setId(2L);
        lowValue.setName("Basic Item");
        lowValue.setValue(new BigDecimal("40.00"));

        ProductMaterial pm1 = new ProductMaterial();
        pm1.setProduct(highValue);
        pm1.setRawMaterial(steel);
        pm1.setRequiredQuantity(5);

        ProductMaterial pm2 = new ProductMaterial();
        pm2.setProduct(lowValue);
        pm2.setRawMaterial(steel);
        pm2.setRequiredQuantity(2);

        highValue.setMaterials(List.of(pm1));
        lowValue.setMaterials(List.of(pm2));

        when(rawMaterialRepository.findAll()).thenReturn(List.of(steel));
        when(productRepository.findAll()).thenReturn(List.of(lowValue, highValue));

        ProductionPlanningService service = new ProductionPlanningService(productRepository, rawMaterialRepository);
        ProductionSuggestionResponse result = service.suggestProduction();

        assertEquals(1, result.items().size());
        assertEquals("Premium Item", result.items().get(0).productName());
        assertEquals(2, result.items().get(0).producibleQuantity());
    }
}
