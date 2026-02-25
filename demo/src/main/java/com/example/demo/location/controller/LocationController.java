package com.example.demo.location.controller;

import com.example.demo.location.dto.DistrictResponse;
import com.example.demo.location.dto.ProvinceResponse;
import com.example.demo.location.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RestController("/api/locations")
public class LocationController {

    private final LocationService locationService;

    //lấy danh sách tỉnh
    @GetMapping("/provinces")
    public ResponseEntity<List<ProvinceResponse>> getAllProvinces(){
        return ResponseEntity.ok(locationService.getAllProvinces());
    }

    // lấy danh sách huyện
    @GetMapping("/provinces/{code}/districts")
    public ResponseEntity<List<DistrictResponse>> getDistrictByProvince(@PathVariable Integer provinceCode){
        return ResponseEntity.ok(locationService.getDistrictByProvince(provinceCode));
    }
}
