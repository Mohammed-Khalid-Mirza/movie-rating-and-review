package com.example.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Movie;
import com.example.demo.model.Review;
import com.example.demo.model.User;
import com.example.demo.repository.MovieRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, MovieRepository movieRepository,
            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/movie/{movieId}")
    public List<Review> getMovieReviews(@PathVariable Long movieId) {
        return reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId);
    }

    @GetMapping("/me")
    public List<Review> getMyReviews(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return reviewRepository.findByUserId(user.getId());
    }

    @GetMapping("/latest")
    public List<ReviewSummary> getLatestReviews(@RequestParam(defaultValue = "6") int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        return reviewRepository
                .findAllBy(PageRequest.of(0, safeLimit, Sort.by("createdAt").descending()))
                .stream()
                .map(ReviewSummary::from)
                .collect(Collectors.toList());
    }

    @PostMapping("/movie/{movieId}")
    public ResponseEntity<?> addReview(@PathVariable Long movieId, @RequestBody ReviewRequest request,
            Authentication authentication) {
        if (request.rating == null || request.rating < 1 || request.rating > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 5");
        }

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Movie movie = movieRepository.findById(movieId).orElse(null);
        if (movie == null) {
            return ResponseEntity.notFound().build();
        }

        if (reviewRepository.findByUserIdAndMovieId(user.getId(), movieId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("You already reviewed this movie");
        }

        Review review = new Review();
        review.setRating(request.rating);
        review.setComment(request.comment);
        review.setUser(user);
        review.setMovie(movie);

        return ResponseEntity.status(HttpStatus.CREATED).body(reviewRepository.save(review));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody ReviewRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        return reviewRepository.findById(id)
                .map(existing -> {
                    if (!isOwnerOrSuperAdmin(authentication, user.getId(), existing.getUser().getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
                    }

                    if (request.rating != null) {
                        if (request.rating < 1 || request.rating > 5) {
                            return ResponseEntity.badRequest().body("Rating must be between 1 and 5");
                        }
                        existing.setRating(request.rating);
                    }
                    if (request.comment != null) {
                        existing.setComment(request.comment);
                    }
                    return ResponseEntity.ok(reviewRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return reviewRepository.findById(id)
                .map(existing -> {
                    if (!isOwnerOrSuperAdmin(authentication, user.getId(), existing.getUser().getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
                    }
                    reviewRepository.delete(existing);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private boolean isOwnerOrSuperAdmin(Authentication authentication, Long currentUserId, Long ownerId) {
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_SUPER_ADMIN"));
        return isSuperAdmin || currentUserId.equals(ownerId);
    }

    public static class ReviewRequest {
        public Integer rating;
        public String comment;
    }

    public static class ReviewSummary {
        public Long id;
        public Integer rating;
        public String comment;
        public String createdAt;
        public Long movieId;
        public String movieTitle;
        public String moviePosterUrl;
        public String userName;

        public static ReviewSummary from(Review review) {
            ReviewSummary summary = new ReviewSummary();
            summary.id = review.getId();
            summary.rating = review.getRating();
            summary.comment = review.getComment();
            summary.createdAt = review.getCreatedAt().toString();
            summary.movieId = review.getMovie().getId();
            summary.movieTitle = review.getMovie().getTitle();
            summary.moviePosterUrl = review.getMovie().getCardUrl();
            summary.userName = review.getUser().getName();
            return summary;
        }
    }
}
