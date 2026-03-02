package com.example.demo.category.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CategoryRequest {

    private String name;
    private String description;
    private Long parentId;
}
