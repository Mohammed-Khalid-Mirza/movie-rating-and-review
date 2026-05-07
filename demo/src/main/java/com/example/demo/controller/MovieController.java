package com.example.demo.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.PageResponseDTO;
import com.example.demo.model.Movie;
import com.example.demo.model.MovieType;
import com.example.demo.repository.MovieRepository;

@RestController
@RequestMapping("/movies")
public class MovieController {
    private final MovieRepository movieRepository;

    public MovieController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<Movie>> getAllMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(name = "type", required = false) MovieType type,
            @RequestParam(name = "genreId", required = false) Long genreId,
            @RequestParam(name = "search", required = false) String search) {

        System.out.println("V4 - Filtering movies - type: " + type + ", genreId: " + genreId + ", search: " + search);

        String searchParam = null;
        if (search != null && !search.trim().isEmpty()) {
            searchParam = "%" + search.toLowerCase().trim() + "%";
        }

        Page<Movie> moviePage = movieRepository.findByFilters(type, genreId, searchParam,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return ResponseEntity.ok()
                .body(new PageResponseDTO<>(moviePage));
    }

    @GetMapping("/recent")
    public List<Movie> getRecentMovies(@RequestParam(defaultValue = "6") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        return movieRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(0, safeLimit, Sort.by("createdAt").descending()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovie(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<Movie> createMovie(@RequestBody Movie request) {
        Movie saved = movieRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Movie> updateMovie(@PathVariable Long id, @RequestBody Movie request) {
        return movieRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(request.getTitle());
                    existing.setDescription(request.getDescription());
                    existing.setGenres(request.getGenres());
                    existing.setReleaseDate(request.getReleaseDate());
                    existing.setDurationMinutes(request.getDurationMinutes());
                    existing.setCardUrl(request.getCardUrl());
                    existing.setBackdropUrl(request.getBackdropUrl());
                    existing.setType(request.getType());
                    return ResponseEntity.ok(movieRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        if (!movieRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        movieRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
