package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByUserIdAndMovieId(Long userId, Long movieId);

    List<Review> findByMovieId(Long movieId);

    @EntityGraph(attributePaths = { "user" })
    List<Review> findByMovieIdOrderByCreatedAtDesc(Long movieId);

    @EntityGraph(attributePaths = { "user", "movie" })
    List<Review> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = { "movie" })
    List<Review> findByUserId(Long userId);
}
