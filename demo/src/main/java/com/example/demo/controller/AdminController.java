package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AdminStatsDTO;
import com.example.demo.repository.GenreRepository;
import com.example.demo.repository.MovieRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admins/stats")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;
    private final GenreRepository genreRepository;

    @GetMapping
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(AdminStatsDTO.builder()
                .totalUsers(userRepository.count())
                .totalMovies(movieRepository.count())
                .totalReviews(reviewRepository.count())
                .totalGenres(genreRepository.count())
                .build());
    }
}
