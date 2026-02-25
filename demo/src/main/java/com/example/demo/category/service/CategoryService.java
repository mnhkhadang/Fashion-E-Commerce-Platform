package com.example.demo.category.service;

import com.example.demo.category.dto.CategoryRequest;
import com.example.demo.category.dto.CategoryResponse;
import com.example.demo.category.entity.Category;
import com.example.demo.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // Admin tạo danh mục
    public CategoryResponse create(CategoryRequest request){
        if(categoryRepository.existsByName(request.getName())){
            throw  new RuntimeException("Category already exists");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        return toResponse(categoryRepository.save(category));
    }
    // Admin cập nhật danh mục
    public CategoryResponse update(Long id, CategoryRequest request){
        Category category = categoryRepository.findById(id)
                .orElseThrow( ()-> new RuntimeException("Category not found"));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        return toResponse(categoryRepository.save(category));
    }
    //Admin xóa danh mục
    public void  delete(Long id){
        Category category = categoryRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Category not found"));
        categoryRepository.delete(category);
    }
    //Xem danh sách danh mục Admin + User + Shop
    public List<CategoryResponse> getAll(){
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Admin + Shop + User: xem chi tiết danh mục
    public CategoryResponse getById(Long id){
        Category category = categoryRepository.findById(id)
                .orElseThrow( ()-> new RuntimeException("Category not found"));
        return toResponse(category);
    }

    private CategoryResponse toResponse(Category category){
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive()
        );
    }
}
