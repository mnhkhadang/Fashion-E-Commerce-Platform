package com.example.demo.shippingaddress.repository;

import com.example.demo.shippingaddress.entity.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {

    @Query("SELECT sa FROM ShippingAddress sa " +
            "JOIN FETCH sa.district " +
            "JOIN FETCH sa.province " +
            "WHERE sa.owner.email = :email")
    List<ShippingAddress> findAllByOwnerEmail(@Param("email") String email);

    @Query("SELECT sa FROM ShippingAddress sa " +
            "JOIN FETCH sa.district " +
            "JOIN FETCH sa.province " +
            "WHERE sa.owner.email = :email AND sa.isDefault = true")
    Optional<ShippingAddress> findDefaultByOwnerEmail(@Param("email") String email);
}
