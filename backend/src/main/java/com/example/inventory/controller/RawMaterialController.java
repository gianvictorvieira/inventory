package com.example.inventory.controller;

import com.example.inventory.dto.RawMaterialRequest;
import com.example.inventory.model.RawMaterial;
import com.example.inventory.service.RawMaterialService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raw-materials")
public class RawMaterialController {

    private final RawMaterialService rawMaterialService;

    public RawMaterialController(RawMaterialService rawMaterialService) {
        this.rawMaterialService = rawMaterialService;
    }

    @GetMapping
    public List<RawMaterial> list() { return rawMaterialService.findAll(); }

    @PostMapping
    public RawMaterial create(@Valid @RequestBody RawMaterialRequest request) {
        return rawMaterialService.create(request);
    }

    @PutMapping("/{id}")
    public RawMaterial update(@PathVariable Long id, @Valid @RequestBody RawMaterialRequest request) {
        return rawMaterialService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        rawMaterialService.delete(id);
    }
}
