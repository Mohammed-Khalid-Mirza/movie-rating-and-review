package com.example.demo.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Genre;
import com.example.demo.repository.GenreRepository;

@RestController
@RequestMapping("/genres")
public class GenreController {
    private final GenreRepository genreRepository;

    public GenreController(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    
    @GetMapping
    public List<Genre> getAllGenres() {
        return genreRepository.findAll();
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<?> createGenre(@RequestBody Genre request) {
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body("Genre name is required");
        }
        if (genreRepository.existsByName(request.getName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Genre already exists");
        }
        Genre saved = genreRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Genre> updateGenre(@PathVariable Long id, @RequestBody Genre request) {
        return genreRepository.findById(id)
                .map(existing -> {
                    existing.setName(request.getName());
                    return ResponseEntity.ok(genreRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGenre(@PathVariable Long id) {
        if (!genreRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        genreRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
