package com.example.demo.location.service;

import com.example.demo.location.dto.DistrictResponse;
import com.example.demo.location.dto.ProvinceResponse;
import com.example.demo.location.repository.DistrictRepository;
import com.example.demo.location.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;

    //lấy danh sánh tỉnh
    public List<ProvinceResponse> getAllProvinces(){
        return provinceRepository.findAll()
                .stream()
                .map(p -> new ProvinceResponse(p.getCode(), p.getName()))
                .toList();
    }

    // lấy danh sách theo tỉnh
    public List<DistrictResponse> getDistrictByProvince(Integer provinceCode){
        return districtRepository.findByProvinceCode(provinceCode)
                .stream()
                .map(d -> new DistrictResponse(d.getCode(), d.getName(), d.getProvince().getCode()))
                .toList();
    }
}
