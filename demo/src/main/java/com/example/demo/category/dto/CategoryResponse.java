package com.example.demo.category.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private boolean active;
    private Long parentId;
    private String parentName;
    private List<CategoryResponse> children;

}
