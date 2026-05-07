package com.example.demo.dto;

import java.util.List;
import org.springframework.data.domain.Page;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PageResponseDTO<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int size;
    private boolean hasNext;
    private boolean hasPrevious;
    private String debugMessage;

    public PageResponseDTO(Page<T> page) {
        this.content = page.getContent();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.currentPage = page.getNumber();
        this.size = page.getSize();
        this.hasNext = page.hasNext();
        this.hasPrevious = page.hasPrevious();
        this.debugMessage = "V2-FILTER-ACTIVE";
    }
}
