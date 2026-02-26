package com.example.demo.config.security;



import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final  CustomUserDetailsService userDetailsService;
    private final  JwtAuthenticationFilter jwtAuthenticationFilter;
    // =========================
    // PASSWORD ENCODER (BẮT BUỘC)
    // =========================
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    // =========================
    // AUTHENTICATION MANAGER
    // =========================
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    )throws Exception{
        return config.getAuthenticationManager();
    }
    // =========================
    // SECURITY FILTER CHAIN
    // =========================
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        http
                // tắt csrf (vì dùng REST API)
                .csrf(AbstractHttpConfigurer::disable)

                // không dùng session (chuẩn JWT sau này)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Product
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("SHOP")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("SHOP")

                        // Category
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                        // Shop
                        .requestMatchers(HttpMethod.GET, "/api/shop").permitAll()
                        .requestMatchers("/api/shop/**").hasRole("SHOP")
                        .requestMatchers("/api/user/**").hasRole("USER")

                        // Cart
                        .requestMatchers(HttpMethod.GET, "/api/cart/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/cart/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/cart/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cart/**").hasAnyRole("USER", "ADMIN")

                        // Location
                        .requestMatchers("/api/locations/**").permitAll()

                        // Shipping Address
                        .requestMatchers("/api/shipping-addresses/**").hasAnyRole("USER", "ADMIN")

                        // Order
                        .requestMatchers(HttpMethod.GET, "/api/orders/shop/**").hasRole("SHOP")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasRole("SHOP")
                        .requestMatchers("/api/orders/**").hasAnyRole("USER", "ADMIN")

                        // Payment
                        .requestMatchers("/api/payments/**").hasAnyRole("USER", "ADMIN")

                        .anyRequest().authenticated()
                )

                // gắn UserDetailsService
                .userDetailsService(userDetailsService)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
