/* =========================================================
   0) 사전: 세션 설정
   ========================================================= */
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_0900_ai_ci';

/* =========================================================
   1) 운세 타입 시드
   ========================================================= */

INSERT INTO fortune_type (fortune_type_id, name)
VALUES (1, '소'),
       (2, '쥐'),
       (3, '용'),
       (4, '토끼'),
       (5, '양'),
       (6, '고양이'),
       (7, '호랑이'),
       (8, '말'),
       (9, '닭'),
       (10, '개'),
       (11, '뱀'),
       (12, '원숭이');

UPDATE fortune_type SET good_with_id=4 , bad_with_id=9  WHERE fortune_type_id=1;
UPDATE fortune_type SET good_with_id=7 , bad_with_id=6  WHERE fortune_type_id=2;
UPDATE fortune_type SET good_with_id=10, bad_with_id=8  WHERE fortune_type_id=3;
UPDATE fortune_type SET good_with_id=1 , bad_with_id=12 WHERE fortune_type_id=4;
UPDATE fortune_type SET good_with_id=8 , bad_with_id=3  WHERE fortune_type_id=5;
UPDATE fortune_type SET good_with_id=11, bad_with_id=2  WHERE fortune_type_id=6;
UPDATE fortune_type SET good_with_id=2 , bad_with_id=11 WHERE fortune_type_id=7;
UPDATE fortune_type SET good_with_id=5 , bad_with_id=3  WHERE fortune_type_id=8;
UPDATE fortune_type SET good_with_id=12, bad_with_id=1  WHERE fortune_type_id=9;
UPDATE fortune_type SET good_with_id=2 , bad_with_id=3  WHERE fortune_type_id=10;
UPDATE fortune_type SET good_with_id=3 , bad_with_id=7  WHERE fortune_type_id=11;
UPDATE fortune_type SET good_with_id=9 , bad_with_id=4  WHERE fortune_type_id=12;

/* =========================================================
   2) 희귀도/쿠키종류 시드
   ========================================================= */
-- rarity
INSERT INTO rarity(code, name, sort_order)
VALUES ('RARE', '레어', 1),
       ('EPIC', '에픽', 2),
       ('UNIQUE', '유니크', 3);

-- cookie_kind
-- 13종 쿠키 시드 (레시피 포함)
INSERT INTO cookie_kind (rarity_id, code, name, recipe, message, created_at, updated_at)
SELECT r.rarity_id, t.code, t.name, t.recipe, t.message, NOW(), NOW()
FROM (
         /* ===== RARE ===== */
         SELECT 'MONEY'       AS code, '금전 쿠키'   AS name,
                '금전운이 가장 높고, 금전운이 +5 이상, 총운이 +10 이상일 때' AS recipe,
                '성공적으로 금전 쿠키가 구워졌습니다!' AS message, 'RARE' AS r
         UNION ALL
         SELECT 'LOVE',        '애정 쿠키',
                '애정운이 가장 높고, 애정운이 +5 이상, 총운이 +10 이상일 때',
                '성공적으로 애정 쿠키가 구워졌습니다!', 'RARE'
         UNION ALL
         SELECT 'ACHIEVEMENT', '성취 쿠키',
                '성취운이 가장 높고, 성취운이 +5 이상, 총운이 +10 이상일 때',
                '성공적으로 성취 쿠키가 구워졌습니다!', 'RARE'
         UNION ALL
         SELECT 'HEALTH',      '건강 쿠키',
                '건강운이 가장 높고, 건강운이 +5 이상, 총운이 +10 이상일 때',
                '성공적으로 건강 쿠키가 구워졌습니다!', 'RARE'
         UNION ALL
         SELECT 'ROTTEN',      '썩은 쿠키',
                '잘 구워 주세요..',
                '쿠키가 상했어요..', 'RARE'

         /* ===== EPIC ===== */
         UNION ALL
         SELECT 'GLOOMY',      '먹구름 쿠키',
                '금전운·애정운·성취운·건강운이 모두 -10 이하일 때',
                '해 뜰 날이 오겠지..', 'EPIC'
         UNION ALL
         SELECT 'PPEPPERO',    '빼빼로 쿠키',
                '애정운이 +11, 나머지 운 중 하나가 +11 일 때',
                '11월 11일에는 역시!', 'EPIC'
         UNION ALL
         SELECT 'SANSAM',      '산삼 쿠키',
                '금전운이 +20 이상, 건강운이 +20 이상일 때',
                '100년 묵은 산삼으로만', 'EPIC'
         UNION ALL
         SELECT 'DEVELOPER',   '개발자 쿠키',
                '금전운이 +10 이상, 동시에 건강운이 -10 이하일 때',
                'Hello World!', 'EPIC'
         UNION ALL
         SELECT 'MIXED',       '믹스 쿠키',
                '금전운·애정운·성취운·건강운이 모두 +10 이상일 때',
                '쿠키 굽기 대성공!!', 'EPIC'

         /* ===== UNIQUE ===== */
         UNION ALL
         SELECT 'LAVA',        '용암 쿠키',
                '금전운·애정운·성취운·건강운이 모두 -20 이하일 때',
                '열정과다!', 'UNIQUE'
         UNION ALL
         SELECT 'SANTA',       '산타 쿠키',
                '애정운이 +12, 동시에 건강운이 +25 일 때',
                '올해는 무슨 선물을 주실까?', 'UNIQUE'
         UNION ALL
         SELECT 'UNICORN',     '유니콘 쿠키',
                '금전운·애정운·성취운·건강운이 모두 +22 이상일 때',
                '쿠키 굽기 대대성공!', 'UNIQUE'
     ) AS t
         JOIN rarity r ON r.code = t.r
ON DUPLICATE KEY UPDATE
                     rarity_id = VALUES(rarity_id),
                     name      = VALUES(name),
                     recipe    = VALUES(recipe),
                     message   = VALUES(message),
                     updated_at= NOW();

UPDATE cookie_kind
SET is_active = 0,
    updated_at = NOW()
WHERE code = 'PPEPPERO';