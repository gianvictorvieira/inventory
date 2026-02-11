package com.example.inventory.controller;

import com.example.inventory.dto.ProductionSuggestionResponse;
import com.example.inventory.service.ProductionPlanningService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/production")
public class ProductionPlanningController {

    private final ProductionPlanningService productionPlanningService;

    public ProductionPlanningController(ProductionPlanningService productionPlanningService) {
        this.productionPlanningService = productionPlanningService;
    }

    @GetMapping("/suggestions")
    public ProductionSuggestionResponse suggestions() {
        return productionPlanningService.suggestProduction();
    }
}
