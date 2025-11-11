package com.ssafy.agzak.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.redis.spring.RedisLockProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.Objects;

@Configuration
public class SchedulerLockConfig {

    @Bean
    public LockProvider lockProvider(StringRedisTemplate stringRedisTemplate) {
        return new RedisLockProvider(
                Objects.requireNonNull(stringRedisTemplate.getConnectionFactory()),
                "shedlock:agzak"
        );
    }
}
