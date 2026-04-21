package com.example.demo.product.service;

import com.example.demo.category.entity.Category;
import com.example.demo.category.repository.CategoryRepository;
import com.example.demo.product.dto.ProductRequest;
import com.example.demo.product.dto.ProductResponse;
import com.example.demo.product.entity.Product;
import com.example.demo.product.entity.ProductMedia;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.sale.entity.Sale;
import com.example.demo.sale.entity.SaleProduct;
import com.example.demo.sale.repository.SaleProductRepository;
import com.example.demo.shop.entity.Shop;
import com.example.demo.shop.repository.ShopRepository;
import jakarta.persistence.Table;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final CategoryRepository categoryRepository;
    private final SaleProductRepository saleProductRepository;

    //Shop đăng bán sản phẩm
    @Transactional
    public ProductResponse create(String email, ProductRequest request) {
        Shop shop = shopRepository.findByOwner_Email(email)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setShop(shop);
        product.setCategory(category);
        product.setSlug("temp"); // ← set tạm để tránh null

        // Save lần 1 để có id
        productRepository.saveAndFlush(product); // ← dùng saveAndFlush

        // Cập nhật slug sau khi có id
        product.setSlug(generateSlug(request.getName(), product.getId()));

        // Thêm media
        if (request.getMediaList() != null) {
            List<ProductMedia> mediaList = request.getMediaList().stream()
                    .map(m -> {
                        ProductMedia media = new ProductMedia();
                        media.setUrl(m.getUrl());
                        media.setType(m.getType());
                        media.setSortOrder(m.getSortOrder());
                        media.setProduct(product);
                        return media;
                    }).collect(Collectors.toList());
            product.setMediaList(mediaList);
        }

        // Save lần 2 với slug và media
        return toResponse(productRepository.save(product));
    }
    //shop cập nhật sản phẩm
    @Transactional
    public ProductResponse update(String email, UUID productId, ProductRequest request) {
        Product product = productRepository.findByIdWithDetails(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getShop().getOwner().getEmail().equals(email)) {
            throw new RuntimeException("You don't have permission to update this product");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category); // ← thêm set category
        product.setSlug(generateSlug(request.getName(), product.getId())); // ← cập nhật slug

        // Cập nhật media
        if (request.getMediaList() != null) {
            product.getMediaList().clear(); // ← xóa media cũ trước
            List<ProductMedia> mediaList = request.getMediaList().stream()
                    .map(m -> {
                        ProductMedia media = new ProductMedia();
                        media.setUrl(m.getUrl());
                        media.setType(m.getType());
                        media.setSortOrder(m.getSortOrder());
                        media.setProduct(product);
                        return media;
                    }).collect(Collectors.toList());
            product.getMediaList().addAll(mediaList); // ← thêm media mới
        }

        return toResponse(productRepository.save(product));
    }

    //shop ẩn hiện sảm phẩm
    @Transactional
    public void toggleActive(String email, UUID productId){
        Product product = productRepository.findByIdWithDetails(productId)
                .orElseThrow(()-> new RuntimeException("Product not found"));

        if(!product.getShop().getOwner().getEmail().equals(email)){
            throw new RuntimeException("You don't have permission to update this product");
        }

        product.setActive(!product.isActive());
        productRepository.save(product);
    }

    // shop xem danh sách sản phẩm của mình
    public List<ProductResponse> getMyProducts(String email){
        Shop shop = shopRepository.findByOwner_Email(email)
                .orElseThrow(()-> new RuntimeException("Shop not found"));
        return productRepository.findByShop(shop.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    //public: xem sản phẩm theo category
    public List<ProductResponse> getByCategory(String categoryName) {
        System.out.println("categoryName received: [" + categoryName + "]");
        System.out.println("categoryName length: " + categoryName.length());
        System.out.println("categoryName bytes: " + java.util.Arrays.toString(categoryName.getBytes()));
        List<Product> products = productRepository.findByCategoryName(categoryName);
        System.out.println("products size: " + products.size());
        return products.stream()
                .map(this::toResponse)
                .toList();
    }

    // Xem chi tiết sản phẩm
    public ProductResponse getBySlug(String slug){
        Product product = productRepository.findBySlug(slug)
                .orElseThrow( ()-> new RuntimeException("Product not found"));
        return toResponse(product);
    }

    //tìm kiếm sản phẩm
    public List<ProductResponse> seacrch(String keyword){
        return productRepository.searchByName(keyword)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    //lay tat cả sản phẩm
    public List<ProductResponse> getAll(){
        return productRepository.findAllActive()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<ProductResponse> getByShop(String shopName) {
        return productRepository.findByShopNameAndActiveTrue(shopName)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    private String generateSlug(String name, UUID id){
        String bassSlug = name.toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        String shortId = id.toString().substring(0, 6);
        return bassSlug+"-"+shortId;
    }

    private ProductResponse toResponse(Product product){

        // Query sale ACTIVE hiện tại của product
        Optional<SaleProduct> activeSale = saleProductRepository
                .findActiveByProductId(product.getId(), LocalDateTime.now());

        BigDecimal salePrice = null;
        Integer discountPercent = null;
        String saleSource = null;

        if (activeSale.isPresent()) {
            Sale sale = activeSale.get().getSale();
            discountPercent = sale.getDiscountPercent();
            saleSource = sale.getCreatedBy().name(); // "PLATFORM" | "SHOP"
            salePrice = product.getPrice()
                    .multiply(BigDecimal.valueOf(100 - discountPercent))
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
        }

        List<ProductResponse.MediaResponse> mediaResponse = product.getMediaList() == null
                ? List.of()
                : product.getMediaList().stream()
                .map( m -> new ProductResponse.MediaResponse(
                        m.getUrl(),
                        m.getType(),
                        m.getSortOrder()
                )).toList();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.isActive(),
                product.getSold(),
                product.getShop().getName(),
                product.getCategory().getName(),
                mediaResponse,
                salePrice,       // ← thêm mới
                discountPercent, // ← thêm mới
                saleSource
        );
    }
}
