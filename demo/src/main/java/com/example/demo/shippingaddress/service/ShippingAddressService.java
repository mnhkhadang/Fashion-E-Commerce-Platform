package com.example.demo.shippingaddress.service;

import com.example.demo.location.entity.District;
import com.example.demo.location.entity.Province;
import com.example.demo.location.repository.DistrictRepository;
import com.example.demo.location.repository.ProvinceRepository;
import com.example.demo.shippingaddress.dto.ShippingAddressRequest;
import com.example.demo.shippingaddress.dto.ShippingAddressResponse;
import com.example.demo.shippingaddress.entity.ShippingAddress;
import com.example.demo.shippingaddress.repository.ShippingAddressRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShippingAddressService {

    private final ShippingAddressRepository shippingAddressRepository;
    private final UserRepository userRepository;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;

    //Lấy danh sách địa chỉ
    public List<ShippingAddressResponse> getAll(String email){
        return shippingAddressRepository.findAllByOwnerEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    //thêm địa chỉ
    @Transactional
    public ShippingAddressResponse add(String email, ShippingAddressRequest request){
        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("User not found"));

        Province province = provinceRepository.findById(request.getProvinceCode())
                .orElseThrow(()-> new RuntimeException("Province not found"));

        District district = districtRepository.findById(request.getDistrictCode())
                .orElseThrow(()->new RuntimeException("District not found"));

        //kiem tra district co thuộc province không
        if(!district.getProvince().getCode().equals(request.getProvinceCode())){
            throw  new RuntimeException("District does not belong to this province");
        }

        if(request.isDefault()){
            shippingAddressRepository.findDefaultByOwnerEmail(email)
                    .ifPresent(old ->{
                        old.setDefault(false);
                        shippingAddressRepository.save(old);
                    });
        }

        ShippingAddress shippingAddress = new ShippingAddress();
        shippingAddress.setFullName(request.getFullName());
        shippingAddress.setPhone(request.getPhone());
        shippingAddress.setStreetAddress(request.getStreetAddress());
        shippingAddress.setDistrict(district);
        shippingAddress.setProvince(province);
        shippingAddress.setDefault(request.isDefault());
        shippingAddress.setOwner(user);
        return toResponse(shippingAddressRepository.save(shippingAddress));
    }

    //chỉnh sưa
    @Transactional
    public ShippingAddressResponse update(String email, Long id, ShippingAddressRequest request ){
        ShippingAddress shippingAddress = shippingAddressRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Address not found"));

        if(!shippingAddress.getOwner().getEmail().equals(email)){
            throw new RuntimeException("You don't have permission to update this address");
        }

        Province province = provinceRepository.findById(request.getProvinceCode())
                .orElseThrow(()->new RuntimeException("Province not found"));

        District district = districtRepository.findById(request.getDistrictCode())
                .orElseThrow(()-> new RuntimeException("District not found"));

        if(!district.getProvince().getCode().equals(request.getProvinceCode())){
            throw  new RuntimeException("District does not belong this Province");
        }

        if(request.isDefault()){
            shippingAddressRepository.findDefaultByOwnerEmail(email)
                    .ifPresent(old ->{
                        if(!old.getId().equals(id)){
                            old.setDefault(false);
                            shippingAddressRepository.save(old);
                        }
                    });
        }

        shippingAddress.setFullName(request.getFullName());
        shippingAddress.setStreetAddress(request.getStreetAddress());
        shippingAddress.setPhone(request.getPhone());
        shippingAddress.setDistrict(district);
        shippingAddress.setProvince(province);
        shippingAddress.setDefault(request.isDefault());
        return toResponse(shippingAddressRepository.save(shippingAddress));
    }

    //delete
    @Transactional
    public void delete(String email, Long id){
        ShippingAddress shippingAddress= shippingAddressRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Address not found"));
        if(!shippingAddress.getOwner().getEmail().equals(email)){
            throw new RuntimeException("You don't have permission to delete this address");
        }
        shippingAddressRepository.delete(shippingAddress);
    }

    //setDefault địa điểm
    @Transactional
    public ShippingAddressResponse setDefault(String email, Long id){
        shippingAddressRepository.findDefaultByOwnerEmail(email)
                .ifPresent(old -> {
                    old.setDefault(false);
                    shippingAddressRepository.save(old);
                });
        ShippingAddress shippingAddress = shippingAddressRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Address not found"));

        if(!shippingAddress.getOwner().getEmail().equals(email)){
            throw new RuntimeException("You don't have permission to update this address");
        }

        shippingAddress.setDefault(true);
        return toResponse(shippingAddressRepository.save(shippingAddress));
    }





    private ShippingAddressResponse toResponse(ShippingAddress address){
        return new ShippingAddressResponse(
                address.getId(),
                address.getFullName(),
                address.getPhone(),
                address.getStreetAddress(),
                address.getProvince().getName(),
                address.getDistrict().getName(),
                address.isDefault()
        );
    }
}
