package com.example.demo.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file")MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "shop") String folder
            ) throws IOException {
        String url = cloudinaryService.uploadImage(file,folder);
        return ResponseEntity.ok(Map.of("url",url));
    }
}
