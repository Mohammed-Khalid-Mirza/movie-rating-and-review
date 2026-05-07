package com.example.demo.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.model.Movie;
import com.example.demo.model.MovieType;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN m.genres g WHERE " +
           "(:type IS NULL OR m.type = :type) AND " +
           "(:genreId IS NULL OR g.id = :genreId) AND " +
           "(:search IS NULL OR LOWER(m.title) LIKE :search)")
    Page<Movie> findByFilters(
            @Param("type") MovieType type,
            @Param("genreId") Long genreId,
            @Param("search") String search,
            Pageable pageable);
}
