-- agzak MySQL DB update query 2.0 / 25.11.11

-- 로컬 + ACTIVE 중복 존재 확인
SELECT email, COUNT(*) cnt
FROM member
WHERE password IS NOT NULL AND COALESCE(status, 'ACTIVE') = 'ACTIVE'
GROUP BY email
HAVING cnt > 1;

-- status NULL 있는지 확인
SELECT COUNT(*) AS null_status_cnt FROM member WHERE status IS NULL;

-- 1) 이메일 유니크 제거
ALTER TABLE member DROP INDEX UQ_member_email;

-- 2) 컬럼 정규화
-- email을 NULL 허용으로 변경
ALTER TABLE member MODIFY email VARCHAR(255) NULL;

-- status NOT NULL + 기본값
-- UPDATE member SET status = 'ACTIVE' WHERE status IS NULL;
ALTER TABLE member MODIFY status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';

-- 3) 생성 컬럼 추가
--  '일반 회원(비밀번호 존재) + ACTIVE'인 경우에만 email 값을 반영, 나머지는 NULL
ALTER TABLE member
    ADD COLUMN email_local_unique VARCHAR(255)
        GENERATED ALWAYS AS (
            CASE
                WHEN password IS NOT NULL AND status = 'ACTIVE' THEN email
                ELSE NULL
                END
            ) STORED;

-- 4) UNIQUE 인덱스 생성 (NULL은 중복 허용 → 소셜/탈퇴는 무제약)
CREATE UNIQUE INDEX UQ_member_email_local_active ON member (email_local_unique);

