FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

COPY . .

RUN chmod +x ./gradlew || true

RUN ./gradlew clean bootJar -x test --no-daemon

RUN set -eux; \
    JAR="$(ls build/libs/*-SNAPSHOT.jar 2>/dev/null || ls build/libs/*.jar | grep -v 'plain' | head -n1)"; \
    echo "Using JAR: ${JAR}"; \
    cp "${JAR}" /app/app.jar

# ---------- runtime stage ----------
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# compose에서 healthcheck: curl 사용 시 필요
RUN apk add --no-cache curl

COPY --from=build /app/app.jar /app/app.jar

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
EXPOSE 8082

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]