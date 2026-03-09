package com.example.demo.location.controller;

import com.example.demo.location.dto.DistrictResponse;
import com.example.demo.location.dto.ProvinceResponse;
import com.example.demo.location.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    //lấy danh sách tỉnh
    @GetMapping("/provinces")
    public ResponseEntity<List<ProvinceResponse>> getAllProvinces(){
        return ResponseEntity.ok(locationService.getAllProvinces());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<DistrictResponse>> getDistrictByProvince(
            @RequestParam(name = "provinceCode") Integer provinceCode
    ) {
        return ResponseEntity.ok(locationService.getDistrictByProvince(provinceCode));
    }
}
