package com.example.demo.category.controller;

import com.example.demo.category.dto.CategoryRequest;
import com.example.demo.category.dto.CategoryResponse;
import com.example.demo.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    //Admin only
    @PostMapping
    public ResponseEntity<CategoryResponse> create(@RequestBody CategoryRequest request){
        return ResponseEntity.ok(categoryService.create(request));
    }

    //Admin only
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(@RequestBody CategoryRequest request,
                                                   @PathVariable Long id){
        return ResponseEntity.ok(categoryService.update(id,request));
    }

    //Admin only
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id){
        categoryService.delete(id);
        return ResponseEntity.ok("Category delete successfully");
    }

    //Admin + Shop + User
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll(){
        return ResponseEntity.ok(categoryService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable Long id){
        return ResponseEntity.ok(categoryService.getById(id));
    }
}
