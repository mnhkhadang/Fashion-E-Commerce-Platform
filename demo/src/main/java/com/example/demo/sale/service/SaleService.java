package com.example.demo.sale.service;

import com.example.demo.common.exception.NotFoundException;
import com.example.demo.common.exception.UnprocessableException;
import com.example.demo.product.entity.Product;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.sale.dto.SaleRequest;
import com.example.demo.sale.dto.SaleResponse;
import com.example.demo.sale.entity.Sale;
import com.example.demo.sale.entity.SaleProduct;
import com.example.demo.sale.repository.SaleProductRepository;
import com.example.demo.sale.repository.SaleRepository;
import com.example.demo.shop.entity.Shop;
import com.example.demo.shop.repository.ShopRepository;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleProductRepository saleProductRepository;
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    // ADMIN
    /** Admin tạo chương trình sale toàn sàn */
    @Transactional
    public SaleResponse createPlatformSale(SaleRequest request){
        validateRequest(request);

        Sale sale = new Sale();
        sale.setName(request.getName());
        sale.setDiscountPercent(request.getDiscountPercent());
        sale.setStartAt(request.getStartAt());
        sale.setEndAt(request.getEndAt());
        sale.setCreatedBy(Sale.SaleCreatedBy.PLATFORM);
        sale.setStatus(resolveStatus(request.getStartAt(), request.getEndAt()));
        saleRepository.save(sale);

        // Gán sản phẩm ngay nếu admin truyền vào
        if (request.getProductIds() != null){
            attachProducts(sale, request.getProductIds());
        }

        log.info("Platform sale created: {}", sale.getName());
        return toResponse(sale);

    }

    /** Admin xem tất cả sale PLATFORM */
    public List<SaleResponse> getAllPlatformSales () {
        return saleRepository.findByCreatedByOrderByCreatedAtDesc(Sale.SaleCreatedBy.PLATFORM)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** Admin xóa sale */
    @Transactional
    public void deleteSale(Long saleId){
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new NotFoundException("Sale not found"));
        saleRepository.delete(sale);
        log.info("Sale deleted: id={}", saleId);
    }

    // SHOP

    /** Shop tạo chương trình sale riêng */
    @Transactional
    public SaleResponse createShopSale (String email, SaleRequest request){
        validateRequest(request);

        Shop shop = shopRepository.findByOwner_Email(email)
                .orElseThrow( () -> new NotFoundException("Shop not found"));

        Sale sale = new Sale();
        sale.setName(request.getName());
        sale.setDiscountPercent(request.getDiscountPercent());
        sale.setStartAt(request.getStartAt());
        sale.setEndAt(request.getEndAt());
        sale.setCreatedBy(Sale.SaleCreatedBy.SHOP);
        sale.setShop(shop);
        sale.setStatus(resolveStatus(request.getStartAt(), request.getEndAt()));
        saleRepository.save(sale);

        if (request.getProductIds() != null) {
            attachProducts(sale, request.getProductIds());
        }

        log.info("Shop sale created: shop={} sale={}", shop.getName(), sale.getName());
        return toResponse(sale);
    }
    /** Shop xem sale của mình */
    public List<SaleResponse> getMySales(String email) {
        Shop shop = shopRepository.findByOwner_Email(email)
                .orElseThrow(() -> new NotFoundException("Shop not found"));
        return saleRepository.findByShopId(shop.getId())
                .stream().map(this::toResponse).toList();
    }

    /** Shop xem danh sách sale PLATFORM đang ACTIVE để opt-in */
    public List<SaleResponse> getActivePlatformSales() {
        return saleRepository
                .findByCreatedByAndStatus(Sale.SaleCreatedBy.PLATFORM, Sale.SaleStatus.ACTIVE)
                .stream().map(this::toResponse).toList();
    }

    /** Shop opt-in sản phẩm vào platform sale */
    @Transactional
    public void optIn(String email, Long saleId, List<String> productIds) {
        Shop shop = shopRepository.findByOwner_Email(email)
                .orElseThrow(() -> new NotFoundException("Shop not found"));

        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new NotFoundException("Sale not found"));

        if (sale.getCreatedBy() != Sale.SaleCreatedBy.PLATFORM) {
            throw new UnprocessableException("Only platform sales support opt-in");
        }
        if (sale.getStatus() == Sale.SaleStatus.ENDED) {
            throw new UnprocessableException("Sale has ended");
        }

        // Chỉ cho phép opt-in sản phẩm thuộc shop mình
        attachProducts(sale, productIds, shop.getId());
        log.info("Shop {} opted in {} products to sale {}", shop.getName(), productIds.size(), saleId);
    }

    /** Shop opt-out sản phẩm khỏi sale */
    @Transactional
    public void optOut(Long saleId, String productId) {
        saleProductRepository.deleteBySaleIdAndProductId(
                saleId, UUID.fromString(productId));
        log.info("Product {} opted out from sale {}", productId, saleId);
    }

    // ─── SCHEDULER — tự động cập nhật status

    /** Chạy mỗi phút, cập nhật UPCOMING → ACTIVE → ENDED */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void syncSaleStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<Sale> all = saleRepository.findAll();
        for (Sale sale : all) {
            Sale.SaleStatus newStatus = resolveStatus(sale.getStartAt(), sale.getEndAt());
            if (newStatus != sale.getStatus()) {
                sale.setStatus(newStatus);
                saleRepository.save(sale);
                log.info("Sale status updated: id={} {} -> {}", sale.getId(), sale.getStatus(), newStatus);
            }
        }
    }

    // Private helpers
    private void validateRequest(SaleRequest req){
        if(req.getDiscountPercent() < 1 || req.getDiscountPercent() > 100){
            throw new UnprocessableException("Discount percent must be between 1 and 100");
        }
        if(!req.getEndAt().isAfter(req.getStartAt())){
            throw new UnprocessableException("End date must be after start date");
        }
    }
    /** Gán product vào sale, không kiểm tra shop */
    private void attachProducts(Sale sale, List<String> productIds){
        for (String pid : productIds){
            UUID uuid = UUID.fromString(pid);
            if(saleProductRepository.existsBySaleIdAndProductId(sale.getId(),uuid)){
                continue;
            }
            Product product = productRepository.findById(uuid)
                    .orElseThrow( ()-> new NotFoundException("Product not found: " + pid));
            SaleProduct sp = new SaleProduct();
            sp.setSale(sale);
            sp.setProduct(product);
            saleProductRepository.save(sp);

        }
    }
    /** Gán product vào sale, kiểm tra product phải thuộc shopId */
    private void attachProducts(Sale sale, List<String> productIds, UUID shopId){
        for (String pid : productIds){
            UUID uuid = UUID.fromString(pid);
            if(saleProductRepository.existsBySaleIdAndProductId(sale.getId(),uuid)){
                continue;
            }
            Product product = productRepository.findById(uuid)
                    .orElseThrow( () -> new NotFoundException("Product not found: "+pid));

            if(!product.getShop().getId().equals(shopId)){
                throw new UnprocessableException("Product "+pid + "does not belong to shop");
            }
            SaleProduct sp = new SaleProduct();
            sp.setSale(sale);
            sp.setProduct(product);
            saleProductRepository.save(sp);
        }
    }

    private Sale.SaleStatus resolveStatus(LocalDateTime startAt, LocalDateTime endAt){
        LocalDateTime now = LocalDateTime.now();
        if(now.isBefore(startAt)){
            return Sale.SaleStatus.UPCOMING;
        }
        if(now.isAfter(endAt)){
            return Sale.SaleStatus.ENDED;
        }
        return Sale.SaleStatus.ACTIVE;
    }

    private SaleResponse toResponse(Sale sale) {
        List<SaleProduct> saleProducts = saleProductRepository.findBySaleId(sale.getId());
        List<SaleResponse.SaleProductItem> items = saleProducts.stream()
                .map(sp -> new SaleResponse.SaleProductItem(
                        sp.getProduct().getId().toString(),
                        sp.getProduct().getName(),
                        sp.getProduct().getSlug()
                )).toList();

        return new SaleResponse(
                sale.getId(),
                sale.getName(),
                sale.getDiscountPercent(),
                sale.getStartAt(),
                sale.getEndAt(),
                sale.getCreatedBy(),
                sale.getStatus(),
                sale.getShop() != null ? sale.getShop().getName() : null,
                items,
                sale.getCreatedAt()
        );
    }

}
