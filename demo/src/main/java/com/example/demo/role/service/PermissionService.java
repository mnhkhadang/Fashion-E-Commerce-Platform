package com.example.demo.role.service;

import com.example.demo.role.entity.Permission;
import com.example.demo.role.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class PermissionService {
    private  final PermissionRepository permissionRepository;

   public Permission create(String name){
       if(permissionRepository.existsByName(name)){
           throw new RuntimeException("Permission already exists");
       }
       Permission p = new Permission();
       p.setName(name);
       return  permissionRepository.save(p);

   }

   public Permission getByName(String name){
       return permissionRepository.findByName(name).orElseThrow(()-> new RuntimeException("Permission not found"));
   }
}
