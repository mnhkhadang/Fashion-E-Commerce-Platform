package com.example.demo.cart.repository;

import com.example.demo.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("SELECT ci FROM CartItem ci " +
            "JOIN FETCH ci.product " +
            "WHERE ci.cart.id = :cartId AND ci.product.id =:productId")
    Optional<CartItem> findByCartIdAndProductId(@Param("cartId") UUID cartId, @Param("productId") UUID productId);
}
