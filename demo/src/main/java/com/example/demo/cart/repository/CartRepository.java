package com.example.demo.cart.repository;

import com.example.demo.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {


        @Query("SELECT c FROM Cart c " +
                "JOIN FETCH c.owner " +
                "LEFT JOIN FETCH c.items i " +
                "LEFT JOIN FETCH i.product p " +
                "LEFT JOIN FETCH p.shop " +
                "WHERE c.owner.email = :email")
        Optional<Cart> findByOwnerEmail(@Param("email") String email);
}
