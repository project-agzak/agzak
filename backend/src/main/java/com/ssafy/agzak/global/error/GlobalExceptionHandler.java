package com.ssafy.agzak.global.error;

import com.ssafy.agzak.domain.game.exception.AttemptLimitReachedException;
import com.ssafy.agzak.domain.game.exception.DailyQuotaExceededException;
import com.ssafy.agzak.domain.game.exception.NoActiveSessionException;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException e, HttpServletRequest req) {
        log.warn("NOT_FOUND: {}", e.getMessage());
        var body = ErrorResponse.of(
                HttpStatus.NOT_FOUND.value(),
                "NOT_FOUND",
                e.getMessage(),
                req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DailyQuotaExceededException.class)
    public ResponseEntity<ErrorResponse> handleQuota(DailyQuotaExceededException e, HttpServletRequest req) {
        log.warn("QUOTA_EXCEEDED: {}", e.getMessage());
        var body = ErrorResponse.of(
                HttpStatus.CONFLICT.value(),
                "QUOTA_EXCEEDED",
                e.getMessage(),
                req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(NoActiveSessionException.class)
    public ResponseEntity<ErrorResponse> handleNoActive(NoActiveSessionException e, HttpServletRequest req) {
        var body = ErrorResponse.of(
                HttpStatus.CONFLICT.value(),
                "NO_ACTIVE_SESSION",
                e.getMessage(),
                req.getRequestURI())
        ;
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(AttemptLimitReachedException.class)
    public ResponseEntity<ErrorResponse> handleAttemptLimit(AttemptLimitReachedException e, HttpServletRequest req) {
        var body = ErrorResponse.of(
                HttpStatus.CONFLICT.value(),
                "ATTEMPT_LIMIT",
                e.getMessage(),
                req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(MethodArgumentNotValidException e, HttpServletRequest req) {
        var msg = e.getBindingResult().getAllErrors().stream()
                .findFirst().map(DefaultMessageSourceResolvable::getDefaultMessage).orElse("Invalid request");
        var body = ErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "BAD_REQUEST",
                msg,
                req.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArg(IllegalArgumentException e, HttpServletRequest req) {
        var body = ErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "BAD_REQUEST",
                e.getMessage(),
                req.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleEtc(Exception e, HttpServletRequest req) {
        log.error("INTERNAL_SERVER_ERROR", e);
        var body = ErrorResponse.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "INTERNAL_SERVER_ERROR",
                "서버 오류가 발생했습니다.",
                req.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}

