COMPOSE=docker compose

set-up:
	@if ! docker network inspect agzak-network >/dev/null 2>&1; then \
		echo "Creating Docker network: agzak-network"; \
		docker network create agzak-network; \
	else \
		echo "Network 'agzak-network' already exists."; \
	fi

# 전체 서비스 실행
up:
	$(COMPOSE) \
			-f db/agzak-mysql.yml \
			-f db/agzak-redis.yml \
			-f backend/agzak-app-server.yml \
			-f infra/mysqld-exporter.yml \
			-f infra/agzak-adminer.yml \
			-f infra/prometheus.yml \
			-f infra/grafana.yml \
			-f infra/loki.yml up -d

up-local:
	$(COMPOSE) \
			-f db/agzak-mysql.yml \
			-f db/agzak-redis.yml \
			-f infra/agzak-adminer.yml up -d\

# 전체 서비스 종료
down:
	$(COMPOSE) \
			-f db/agzak-mysql.yml \
			-f db/agzak-redis.yml \
			-f backend/agzak-app-server.yml \
			-f infra/mysqld-exporter.yml \
			-f infra/agzak-adminer.yml \
			-f infra/prometheus.yml \
			-f infra/grafana.yml \
			-f infra/loki.yml down

down-local:
	$(COMPOSE) \
			-f db/agzak-mysql.yml \
			-f db/agzak-redis.yml \
			-f infra/agzak-adminer.yml down

# 전체 로그 보기
logs:
	$(COMPOSE) \
			-f db/agzak-mysql.yml \
			-f db/agzak-redis.yml \
			-f backend/agzak-app-server.yml \
			-f infra/mysqld-exporter.yml \
			-f infra/agzak-adminer.yml \
			-f infra/prometheus.yml \
			-f infra/grafana.yml \
			-f infra/loki.yml logs -f

# 개별 서비스 실행
up-app:
	$(COMPOSE) -f backend/agzak-app-server.yml up -d

up-mysql:
	$(COMPOSE) -f db/agzak-mysql.yml up -d

up-redis:
	$(COMPOSE) -f db/agzak-redis.yml up -d

up-grafana:
	$(COMPOSE) -f infra/grafana.yml up -d

# 개별 서비스 종료
down-app:
	$(COMPOSE) -f backend/agzak-app-server.yml down

down-mysql:
	$(COMPOSE) -f docker/agzak-mysql.yml down

down-redis:
	$(COMPOSE) -f db/agzak-redis.yml down

down-grafana:
	$(COMPOSE) -f infra/grafana.yml down

# 개별 서비스 로그
logs-app:
	$(COMPOSE) -f backend/agzak-app-server.yml logs -f

logs-mysql:
	$(COMPOSE) -f db/agzak-mysql.yml logs -f

logs-redis:
	$(COMPOSE) -f db/agzak-redis.yml logs -f

logs-grafana:
	$(COMPOSE) -f infra/grafana.yml logs -f