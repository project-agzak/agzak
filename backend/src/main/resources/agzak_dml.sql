SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_0900_ai_ci';

INSERT INTO fortune_type (fortune_type_id, name) VALUES
                                                     (1, '소'),
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

UPDATE fortune_type SET good_with_id = 4,  bad_with_id = 9  WHERE fortune_type_id = 1;  -- 소
UPDATE fortune_type SET good_with_id = 7,  bad_with_id = 6  WHERE fortune_type_id = 2;  -- 쥐
UPDATE fortune_type SET good_with_id = 10, bad_with_id = 8  WHERE fortune_type_id = 3;  -- 용
UPDATE fortune_type SET good_with_id = 1,  bad_with_id = 12 WHERE fortune_type_id = 4;  -- 토끼
UPDATE fortune_type SET good_with_id = 8,  bad_with_id = 3  WHERE fortune_type_id = 5;  -- 양
UPDATE fortune_type SET good_with_id = 11, bad_with_id = 2  WHERE fortune_type_id = 6;  -- 고양이
UPDATE fortune_type SET good_with_id = 2,  bad_with_id = 11 WHERE fortune_type_id = 7;  -- 호랑이
UPDATE fortune_type SET good_with_id = 5,  bad_with_id = 3  WHERE fortune_type_id = 8;  -- 말
UPDATE fortune_type SET good_with_id = 12, bad_with_id = 1  WHERE fortune_type_id = 9;  -- 닭
UPDATE fortune_type SET good_with_id = 2,  bad_with_id = 3  WHERE fortune_type_id = 10; -- 개
UPDATE fortune_type SET good_with_id = 3,  bad_with_id = 7  WHERE fortune_type_id = 11; -- 뱀
UPDATE fortune_type SET good_with_id = 9,  bad_with_id = 4  WHERE fortune_type_id = 12; -- 원숭이