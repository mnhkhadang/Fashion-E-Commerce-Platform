package com.example.demo.shop.repository;

import com.example.demo.shop.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<Shop, UUID> {

    @Query("SELECT s FROM Shop s JOIN FETCH s.owner WHERE s.owner.email = :email")
    Optional<Shop> findByOwner_Email(@Param("email") String email);

    @Query("SELECT s FROM Shop s JOIN FETCH s.owner WHERE s.name = :name")
    Optional<Shop> findByIdWithOwner(@Param("name") String name);

    @Query("SELECT s FROM Shop s JOIN FETCH s.owner")
    List<Shop> findALlWithOwner();

    boolean existsByOwner_Email(String email);
}