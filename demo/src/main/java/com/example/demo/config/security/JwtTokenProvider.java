package com.example.demo.config.security;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final String JWT_SECRET = "mySuperSecretKeyThatIsVeryLongForSecurity123";
    private final long JWT_EXPIRATION = 86400000;

    private Key getSigningKey(){
        return Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }

    public String generateToken(String username){
        Date now = new Date();
        Date expiryDate = new Date(now.getTime()+ JWT_EXPIRATION);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromJWT(String token){
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String token){
        try{
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return  true;
        }catch ( JwtException | IllegalArgumentException ex){
            return false;
        }
    }
}
