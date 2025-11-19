import asyncio
import aiomysql
from openai import AsyncOpenAI
from config import settings

# --- 1. RAG DB에 채울 '키(Key)' 카탈로그 ---
ASTROLOGY_KEYS = [
    {"key": "DEFAULT_POSITIVE", "category": "general"},
    
    # --- 성취운 (Achievement) ---
    {"key": "VETO_ACHIEVEMENT_HARD_ASPECT", "category": "achievement"},
    {"key": "ACHIEVEMENT_MAJOR_POSITIVE", "category": "achievement"},
    {"key": "ACHIEVEMENT_MARS_POSITIVE", "category": "achievement"},
    {"key": "ACHIEVEMENT_MOON_POSITIVE", "category": "achievement"},
    {"key": "ACHIEVEMENT_MOON_NEGATIVE", "category": "achievement"},

    # --- 연애운 (Love) ---
    {"key": "LOVE_JUPITER_POSITIVE", "category": "love"},
    {"key": "LOVE_VENUS_POSITIVE", "category": "love"},
    {"key": "LOVE_MARS_POSITIVE", "category": "love"},
    {"key": "LOVE_MOON_POSITIVE", "category": "love"},
    {"key": "LOVE_SATURN_NEGATIVE", "category": "love"},
    {"key": "LOVE_VENUS_NEGATIVE", "category": "love"},
    {"key": "LOVE_MARS_NEGATIVE", "category": "love"},
    {"key": "LOVE_MOON_NEGATIVE", "category": "love"},
    
    # --- 건강운 (Health) ---
    {"key": "HEALTH_POSITIVE_MAJOR", "category": "health"},
    {"key": "HEALTH_POSITIVE_MINOR", "category": "health"},
    {"key": "HEALTH_SATURN_NEGATIVE", "category": "health"},
    {"key": "HEALTH_NEGATIVE_MINOR", "category": "health"},
    {"key": "HEALTH_MOON_POSITIVE", "category": "health"},
    {"key": "HEALTH_MOON_NEGATIVE", "category": "health"},

    # --- 금전운 (Money) ---
    {"key": "MONEY_JUPITER_POSITIVE", "category": "money"},
    {"key": "MONEY_VENUS_POSITIVE", "category": "money"},
    {"key": "MONEY_MOON_POSITIVE", "category": "money"},
    {"key": "MONEY_SATURN_NEGATIVE", "category": "money"},
    {"key": "MONEY_JUPITER_NEGATIVE", "category": "money"},
    {"key": "MONEY_VENUS_NEGATIVE", "category": "money"},
    {"key": "MONEY_MOON_NEGATIVE", "category": "money"},
]

# --- 2. GMS(LLM)에게 보낼 '전문가 해설' 생성용 프롬프트 ---
SYSTEM_PROMPT_FOR_RAG_BUILDER = """
당신은 30년 경력의 전문 점성가이며, '점성술 해설 데이터베이스'를 구축하고 있습니다.
내가 점성술의 '기술적 키(Key)'를 제공하면, 당신은 그 키가 의미하는 [핵심 의미], [발생 가능한 현상], [전문가 조언]을 2~3문장의 '전문가 해설' 텍스트로 작성해야 합니다.

[규칙]
1.  이 텍스트는 나중에 다른 AI(LLM)가 읽고 '요약'할 원본 레시피입니다.
2.  따라서, '화성', '금성', '어스펙트' 같은 점성술 용어를 사용해도 좋습니다.
3.  AI가 이해하기 쉽도록 핵심 의미를 명확하게 작성해야 합니다.
4.  인사말이나 "해설은 다음과 같습니다:" 같은 부가적인 말은 절대 금지합니다. **오직 '해설' 텍스트만 출력하세요.**
5.  답변은 반드시 한국어로 작성하세요.
"""

# 3. RAG DB 테이블 생성용 SQL ---
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS interpretations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aspect_key VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    interpretation_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
"""

# --- 4. GMS(LLM) 호출 함수 ---
async def generate_interpretation(client, key_info):
    """GMS를 호출하여 '키'에 대한 '해설'을 생성합니다."""
    
    key = key_info["key"]
    category = key_info["category"]
    
    print(f"[LLM 호출] '{key}'에 대한 전문가 해설 생성 요청...")
    
    try:
        completion = await client.chat.completions.create(
            model=settings.GMS_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT_FOR_RAG_BUILDER},
                {"role": "user", "content": key}
            ],
            temperature=0.3, # '창의적'인 해석이 아닌 '정확한' 해석을 위해 온도를 낮춤
            max_tokens=300
        )
        
        interpretation_text = completion.choices[0].message.content.strip()
        print(f"[LLM 성공] '{key}' 해설 생성 완료.")
        return key, category, interpretation_text
        
    except Exception as e:
        print(f"[LLM 오류] 키 '{key}' 생성 중 에러 발생: {e}")
        return key, category, None

# --- 5. 메인 실행 로직 ---
async def main():
    print("--- RAG DB 데이터 생성을 시작합니다 ---")
    
    # 1. GMS 클라이언트 초기화
    client = None
    try:
        client = AsyncOpenAI(
            api_key=settings.GMS_API_KEY,
            base_url=settings.GMS_BASE_URL
        )
    except Exception as e:
        print(f"CRITICAL: GMS/OpenAI 클라이언트 초기화 실패: {e}")
        return

    # 2. GMS에 모든 키에 대한 해설 병렬 요청
    tasks = [generate_interpretation(client, key_info) for key_info in ASTROLOGY_KEYS]
    results = await asyncio.gather(*tasks)

    # 3. MySQL DB에 연결
    db_pool = None
    try:
        db_pool = await aiomysql.create_pool(
            host=settings.DB_HOST, port=settings.DB_PORT,
            user=settings.DB_USER, password=settings.DB_PASSWORD,
            db=settings.DB_NAME, autocommit=True, charset='utf8mb4'
        )
    except Exception as e:
        print(f"CRITICAL: DB 연결 실패: {e}")
        if client: await client.close()
        return

    # 4. [신규] DB 테이블 생성 (IF NOT EXISTS)
    print("\n--- MySQL DB 테이블 확인 및 생성 ---")
    try:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(CREATE_TABLE_SQL)
                print("[DB] 'interpretations' 테이블 확인/생성 완료.")
    except Exception as e:
        print(f"CRITICAL: DB 테이블 생성 실패: {e}")
        if db_pool: db_pool.close()
        if client: await client.close()
        return

    print("\n--- MySQL DB에 데이터 삽입 시작 ---")
    inserted_count = 0
    failed_count = 0

    async with db_pool.acquire() as conn:
        async with conn.cursor() as cursor:
            # (MySQL의 'UPSERT' 구문)
            sql = """
            INSERT INTO interpretations (aspect_key, category, interpretation_text)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                category = VALUES(category),
                interpretation_text = VALUES(interpretation_text)
            """
            for key, category, text in results:
                if text:
                    try:
                        await cursor.execute(sql, (key, category, text))
                        print(f"[DB 성공] '{key}' 삽입/업데이트 완료.")
                        inserted_count += 1
                    except Exception as e:
                        print(f"[DB 오류] '{key}' 삽입 실패: {e}")
                        failed_count += 1
                else:
                    print(f"[DB 건너뜀] '{key}' (LLM 생성 실패로 삽입 안 함)")
                    failed_count += 1

    db_pool.close()
    await db_pool.wait_closed()
    await client.close()

    print("\n--- RAG DB 데이터 생성 완료 ---")
    print(f"성공: {inserted_count} 건 / 실패: {failed_count} 건")

if __name__ == "__main__":
    asyncio.run(main())