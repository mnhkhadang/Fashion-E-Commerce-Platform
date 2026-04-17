package com.example.demo.config.security;


import com.example.demo.user.entity.User;

import com.example.demo.user.entity.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;


public class UserPrincipal implements UserDetails {
    private final User user;

    public UserPrincipal(User user){
        this.user = user;
    }

    @Override
    public  String getUsername(){
        return user.getEmail(); // dùng email để logn
    }

    @Override
    public  String getPassword(){
        return  user.getPassword();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        var authorities = user.getRoles()
                .stream()
                .map(UserRole::getRole)
                .map(role -> new SimpleGrantedAuthority(role.getRole()))
                .collect(Collectors.toList());

        // System.out.println("Authorities: " + authorities);
        return authorities;
    }


    @Override
    public  boolean isEnabled(){
        return  true;
    }

    @Override
    public boolean isAccountNonExpired(){
        return true;
    }

    @Override
    public boolean isAccountNonLocked(){
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired(){
        return true;
    }

}
