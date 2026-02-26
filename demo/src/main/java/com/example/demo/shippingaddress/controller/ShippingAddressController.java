package com.example.demo.shippingaddress.controller;

import com.example.demo.shippingaddress.dto.ShippingAddressRequest;
import com.example.demo.shippingaddress.dto.ShippingAddressResponse;
import com.example.demo.shippingaddress.service.ShippingAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipping-addresses")
@RequiredArgsConstructor
public class ShippingAddressController {

    private final ShippingAddressService shippingAddressService;

    //lấy danh sách địa chỉ
    @GetMapping
    public ResponseEntity<List<ShippingAddressResponse>> getAll(
            @AuthenticationPrincipal UserDetails userDetails
            ){
        return ResponseEntity.ok(shippingAddressService.getAll(userDetails.getUsername()));
    }

    //thêm địa chỉ mới
    @PostMapping
    public ResponseEntity<ShippingAddressResponse> add(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ShippingAddressRequest request
            ){
        return ResponseEntity.ok(shippingAddressService.add(userDetails.getUsername(),request));
    }
    //update
    @PutMapping("{id}")
    public ResponseEntity<ShippingAddressResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody ShippingAddressRequest request
    ){
        return ResponseEntity.ok(shippingAddressService.update(userDetails.getUsername(),id,request));
    }
    //delete
    @DeleteMapping("{id}")
    public ResponseEntity<String> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ){
        shippingAddressService.delete(userDetails.getUsername(),id);
        return ResponseEntity.ok("Address deleted successfully");

    }

    // sua địa chỉ
    @PutMapping("{id}/default")
    public ResponseEntity<ShippingAddressResponse> setDefault(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ){
        return ResponseEntity.ok(shippingAddressService.setDefault(userDetails.getUsername(),id));
    }
}
