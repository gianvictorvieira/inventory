package com.example.inventory.controller;

import com.example.inventory.dto.ProductionSuggestionResponse;
import com.example.inventory.service.ProductionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/production")
public class ProductionController {

    private final ProductionService productionService;

    public ProductionController(ProductionService productionService) {
        this.productionService = productionService;
    }

    @GetMapping("/suggestion")
    public ProductionSuggestionResponse getSuggestion() {
        return productionService.suggestProduction();
    }
}
