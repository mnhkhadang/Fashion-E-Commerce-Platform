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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
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

                        // Shop Registration
                        .requestMatchers(HttpMethod.POST, "/api/shop-registrations").hasRole("USER")
                        .requestMatchers(HttpMethod.GET, "/api/shop-registrations/my").hasRole("USER")
                        .requestMatchers("/api/shop-registrations/**").hasRole("ADMIN")

                        // Shop
                        .requestMatchers(HttpMethod.GET, "/api/shop").permitAll()
                        .requestMatchers("/api/shop/**").hasRole("SHOP")

                        // User profile
                        .requestMatchers("/api/user/**").authenticated()

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

                        // Reviews
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reviews/**").hasAnyRole("USER", "SHOP", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/**").hasAnyRole("USER", "SHOP", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").hasAnyRole("USER", "SHOP", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/upload").hasAnyRole("SHOP", "USER", "ADMIN")

                        .anyRequest().authenticated()
                )
                .userDetailsService(userDetailsService)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}