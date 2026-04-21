package com.example.demo.location.repository;

import com.example.demo.location.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, Integer> {

    @Query("SELECT d FROM District d " +
            "WHERE d.province.code =:provinceCode")
    List<District> findByProvinceCode(@Param("provinceCode") Integer provinceCode);
}
