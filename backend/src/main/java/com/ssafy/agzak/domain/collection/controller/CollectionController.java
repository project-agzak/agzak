package com.ssafy.agzak.domain.collection.controller;

import com.ssafy.agzak.docs.CollectionApiDocs;
import com.ssafy.agzak.domain.collection.dto.response.CollectionItemResponse;
import com.ssafy.agzak.domain.collection.service.CollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/collection")
public class CollectionController implements CollectionApiDocs {

    private final CollectionService collectionService;

    @GetMapping
    public ResponseEntity<List<CollectionItemResponse>> myCollection() {
        return ResponseEntity.ok(collectionService.getMyCollection());
    }

    @GetMapping("/members")
    public ResponseEntity<List<CollectionItemResponse>> collectionByMember(
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) String nickname
    ) {
        if (memberId != null) {
            return ResponseEntity.ok(collectionService.getCollectionByMemberId(memberId));
        }
        if (StringUtils.hasText(nickname)) {
            return ResponseEntity.ok(collectionService.getCollectionByNickname(nickname.trim()));
        }
        return ResponseEntity.badRequest().build();
    }
}