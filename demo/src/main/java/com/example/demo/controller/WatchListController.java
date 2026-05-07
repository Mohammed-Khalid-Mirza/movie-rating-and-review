package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Movie;
import com.example.demo.model.User;
import com.example.demo.model.WatchListItem;
import com.example.demo.repository.MovieRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WatchListRepository;

@RestController
@RequestMapping("/watchlist")
public class WatchListController {
    private final WatchListRepository watchListRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public WatchListController(WatchListRepository watchListRepository, MovieRepository movieRepository,
            UserRepository userRepository) {
        this.watchListRepository = watchListRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public List<WatchListItem> getMyWatchList(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return watchListRepository.findByUserId(user.getId());
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<?> addToWatchList(@PathVariable Long movieId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Movie movie = movieRepository.findById(movieId).orElse(null);
        if (movie == null) {
            return ResponseEntity.notFound().build();
        }

        if (watchListRepository.findByUserIdAndMovieId(user.getId(), movieId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Movie already in watch list");
        }

        WatchListItem item = new WatchListItem();
        item.setUser(user);
        item.setMovie(movie);
        item.setWatched(false);

        return ResponseEntity.status(HttpStatus.CREATED).body(watchListRepository.save(item));
    }

    @PatchMapping("/{movieId}")
    public ResponseEntity<?> updateWatchStatus(@PathVariable Long movieId, @RequestBody WatchStatusRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return watchListRepository.findByUserIdAndMovieId(user.getId(), movieId)
                .map(existing -> {
                    existing.setWatched(request.watched);
                    return ResponseEntity.ok(watchListRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<String> removeFromWatchList(@PathVariable Long movieId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return watchListRepository.findByUserIdAndMovieId(user.getId(), movieId)
                .map(existing -> {
                    watchListRepository.delete(existing);
                    return ResponseEntity.ok("Movie removed from watch list");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public static class WatchStatusRequest {
        public boolean watched;
    }
}
