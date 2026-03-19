package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Bật @Scheduled annotation cho toàn bộ project.
 * Cần thiết để ReservationCleanupScheduler hoạt động.
 *
 * Nếu DemoApplication.java đã có @EnableScheduling thì không cần file này.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
