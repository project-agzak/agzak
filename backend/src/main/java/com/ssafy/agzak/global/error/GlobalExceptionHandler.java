package com.ssafy.agzak.global.error;

import com.ssafy.agzak.domain.fortune.exception.IllegalCityNameException;
import com.ssafy.agzak.domain.game.exception.AttemptLimitReachedException;
import com.ssafy.agzak.domain.game.exception.DailyQuotaExceededException;
import com.ssafy.agzak.domain.game.exception.NoActiveSessionException;
import com.ssafy.agzak.domain.member.exception.NoFortuneFoundException;
import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.TypeMismatchException;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.NoSuchElementException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ===== Helper =====
    private ResponseEntity<ErrorResponse> build(HttpStatus status, String code, String message, HttpServletRequest req) {
        var body = ErrorResponse.of(status.value(), code, message, req.getRequestURI());
        // 로깅 레벨 일원화: 4xx는 warn, 5xx는 error
        if (status.is5xxServerError()) {
            log.error("{}: {}", code, message);
        } else {
            log.warn("{}: {}", code, message);
        }
        return ResponseEntity.status(status).body(body);
    }

    // ===== 401 Unauthorized =====
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuth(AuthenticationException e, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", e.getMessage(), req);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwt(JwtException e, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", e.getMessage(), req);
    }

    // ===== 403 Forbidden =====
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "FORBIDDEN", e.getMessage() + "접근 권한이 없습니다.", req);
    }

    // ===== 404 Not Found =====
    @ExceptionHandler({
            EntityNotFoundException.class,
            NoSuchElementException.class,
            NoFortuneFoundException.class
    })
    public ResponseEntity<ErrorResponse> handleNotFound(RuntimeException e, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "NOT_FOUND", e.getMessage(), req);
    }

    // ===== 405 Method Not Allowed =====
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotAllowed(HttpRequestMethodNotSupportedException e, HttpServletRequest req) {
        return build(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", e.getMessage() + "허용되지 않는 HTTP 메서드입니다.", req);
    }

    // ===== 415 Unsupported Media Type =====
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaType(HttpMediaTypeNotSupportedException e, HttpServletRequest req) {
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE", e.getMessage() + "지원하지 않는 미디어 타입입니다.", req);
    }

    // ===== 400 Bad Request (검증/파라미터) =====
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e, HttpServletRequest req) {
        var msg = e.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .orElse("잘못된 요청입니다.");
        return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", msg, req);
    }

    @ExceptionHandler(BindException.class) // @Valid @ModelAttribute 바인딩 오류
    public ResponseEntity<ErrorResponse> handleBind(BindException e, HttpServletRequest req) {
        var msg = e.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .orElse("요청 바인딩에 실패했습니다.");
        return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", msg, req);
    }

    @ExceptionHandler({
            ConstraintViolationException.class,               // @Validated 메서드 파라미터
            MissingServletRequestParameterException.class,    // 필수 쿼리/폼 파라미터 누락
            MethodArgumentTypeMismatchException.class,        // 타입 불일치 (?id=abc)
            TypeMismatchException.class,
            HttpMessageNotReadableException.class,            // JSON 파싱 오류
            IllegalArgumentException.class,
            IllegalCityNameException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception e, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", e.getMessage(), req);
    }

    // ===== 409 Conflict =====
    @ExceptionHandler({
            DataIntegrityViolationException.class,    // 무결성/유니크/NOT NULL 위반
            IllegalStateException.class,              // 상태 충돌
            DailyQuotaExceededException.class,
            NoActiveSessionException.class,
            AttemptLimitReachedException.class
    })
    public ResponseEntity<ErrorResponse> handleConflict(RuntimeException e, HttpServletRequest req) {
        String code = "CONFLICT";
        if (e instanceof DailyQuotaExceededException) code = "QUOTA_EXCEEDED";
        else if (e instanceof NoActiveSessionException) code = "NO_ACTIVE_SESSION";
        else if (e instanceof AttemptLimitReachedException) code = "ATTEMPT_LIMIT";
        return build(HttpStatus.CONFLICT, code, e.getMessage(), req);
    }

    // ===== ResponseStatusException (직접 지정한 상태 사용) =====
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleRse(ResponseStatusException e, HttpServletRequest req) {
        var status = HttpStatus.valueOf(e.getStatusCode().value());
        var code = status.toString();
        var msg = e.getReason() == null ? status.getReasonPhrase() : e.getReason();
        return build(status, code, msg, req);
    }

    // ===== Fallback 500 =====
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleEtc(Exception e, HttpServletRequest req) {
        log.error("INTERNAL_SERVER_ERROR", e);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "서버 오류가 발생했습니다.", req);
    }
}
