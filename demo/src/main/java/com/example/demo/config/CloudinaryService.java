package com.example.demo.config;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.util.ObjectUtils;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) throws IOException{
        Map<? , ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                Map.of(
                        "folder", folder,
                        "resource_type", "auto"
                )
        );
        return result.get("secure_url").toString();
    }

    public void deleteImage(String publicId) throws IOException{
        cloudinary.uploader().destroy(publicId, Map.of());
    }
}
