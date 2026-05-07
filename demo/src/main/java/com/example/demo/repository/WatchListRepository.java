package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.WatchListItem;

public interface WatchListRepository extends JpaRepository<WatchListItem, Long> {
    Optional<WatchListItem> findByUserIdAndMovieId(Long userId, Long movieId);

    @EntityGraph(attributePaths = { "movie", "movie.genres" })
    List<WatchListItem> findByUserId(Long userId);
}
