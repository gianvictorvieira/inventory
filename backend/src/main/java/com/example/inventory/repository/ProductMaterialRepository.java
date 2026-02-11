package com.example.inventory.repository;

import com.example.inventory.model.ProductMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductMaterialRepository extends JpaRepository<ProductMaterial, Long> {

    List<ProductMaterial> findByProductId(Long productId);

    Optional<ProductMaterial> findByProductIdAndRawMaterialId(Long productId, Long rawMaterialId);
}
