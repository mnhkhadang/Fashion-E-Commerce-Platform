package com.example.demo.category.service;

import com.example.demo.category.dto.CategoryRequest;
import com.example.demo.category.dto.CategoryResponse;
import com.example.demo.category.entity.Category;
import com.example.demo.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        return toResponse(categoryRepository.save(category));
    }
    // Admin cập nhật danh mục
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findByIdWithParent(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(request.getName());
        category.setDescription(request.getDescription());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

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

    // lấy tất cả danh mục theo cây
    @Transactional
    public List<CategoryResponse> getTree() {
        List<Category> roots = categoryRepository.findRootsWithChildren();  // ← dùng query fetch children
        return roots.stream()
                .map(this::toResponseWithChildren)  // ← dùng method mới
                .toList();
    }
    //lấy tất cả các danh mục phẳng
    public List<CategoryResponse> getALl(){
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CategoryResponse toResponse(Category category){
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive(),
                category.getParent() != null ? category.getParent().getId() : null,
                category.getParent() != null ? category.getParent().getName() : null,
                List.of()
        );
    }
    private CategoryResponse toResponseWithChildren(Category category) {
        List<CategoryResponse> children = category.getChildren().stream()
                .map(this::toResponseWithChildren)
                .toList();
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive(),
                category.getParent() != null ? category.getParent().getId() : null,
                category.getParent() != null ? category.getParent().getName() : null,
                children  // ← truyền children thật
        );
    }
}
