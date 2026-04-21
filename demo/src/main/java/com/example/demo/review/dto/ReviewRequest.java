package com.example.demo.review.dto;


import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class ReviewRequest {

    private int rating;
    private String comment;
    private List<ReviewMediaRequest> mediaRequestList;

}
