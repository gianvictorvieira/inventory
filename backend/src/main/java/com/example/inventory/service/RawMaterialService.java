package com.example.inventory.service;

import com.example.inventory.dto.RawMaterialRequest;
import com.example.inventory.model.RawMaterial;
import com.example.inventory.repository.RawMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;

    public RawMaterialService(RawMaterialRepository rawMaterialRepository) {
        this.rawMaterialRepository = rawMaterialRepository;
    }

    public List<RawMaterial> findAll() {
        return rawMaterialRepository.findAll();
    }

    public RawMaterial findById(Long id) {
        return rawMaterialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Raw material not found"));
    }

    // ✅ AQUI ESTÁ A REGRA CORRETA
    public RawMaterial create(RawMaterialRequest request) {

        return rawMaterialRepository.findByNameIgnoreCase(request.name())
                .map(existing -> {
                    // Se já existir → soma estoque
                    existing.setStockQuantity(
                            existing.getStockQuantity() + request.stockQuantity()
                    );
                    return rawMaterialRepository.save(existing);
                })
                .orElseGet(() -> {
                    // Se não existir → cria novo
                    RawMaterial material = new RawMaterial();
                    material.setName(request.name());
                    material.setStockQuantity(request.stockQuantity());
                    return rawMaterialRepository.save(material);
                });
    }

    public RawMaterial update(Long id, RawMaterialRequest request) {
        RawMaterial material = findById(id);
        material.setName(request.name());
        material.setStockQuantity(request.stockQuantity());
        return rawMaterialRepository.save(material);
    }

    public void delete(Long id) {
        rawMaterialRepository.deleteById(id);
    }
}
