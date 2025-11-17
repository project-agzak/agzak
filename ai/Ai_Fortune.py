import os
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from typing import Dict, Any
import aiomysql 
from openai import AsyncOpenAI 
from config import settings
import aiomysql
import logging

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 1. Java 서비스로부터 받을 입력 모델 (ScoreCalculationResult)
class ScoreInput(BaseModel):
    scores: Dict[str, int]
    keyDrivers: Dict[str, str]

# 2. Java 서비스에게 반환할 최종 모델 (FortuneScoreResponse)
class FortuneScoreResponse(BaseModel):
    total_score: int
    love: int
    health: int
    money: int
    achievement: int
    total_summary: str
    detailed_summaries: Dict[str, str]

# --- FastAPI 앱, DB, AI 클라이언트 설정 ---
app = FastAPI()
db_pool = None 

try:
    async_client = AsyncOpenAI(
        api_key=settings.GMS_API_KEY,
        base_url=settings.GMS_BASE_URL
    )
except Exception as e:
    logger.error(f"CRITICAL: Failed to initialize GMS/OpenAI client: {e}")
    async_client = None


@app.on_event("startup")
async def startup_event():
    
    """
    FastAPI 서버가 시작될 때 MySQL 커넥션 풀을 생성합니다.
    """
    global db_pool
    try:
        db_pool = await aiomysql.create_pool(
            host=settings.DB_HOST, port=settings.DB_PORT,
            user=settings.DB_USER, password=settings.DB_PASSWORD,
            db=settings.DB_NAME, autocommit=True,
            charset='utf8mb4'
        )
        logger.info(f"FastAPI: MySQL ({settings.DB_HOST}:{settings.DB_PORT}) 커넥션 풀 생성 완료.")
    except Exception as e:
        print(f"FastAPI: DB 커넥션 풀 생성 실패: {e}")
        db_pool = None

@app.on_event("shutdown")
async def shutdown_event():
    """
    FastAPI 서버가 종료될 때 MySQL 커넥션 풀을 닫습니다.
    """
    if db_pool:
        db_pool.close()
        await db_pool.wait_closed()

# --- RAG 서비스 로직 (DB 쿼리) ---

async def get_interpretation_from_db(driver_key: str) -> str:
    """
    [RAG - Retrieval]
    MySQL DB에서 '핵심 근거(key)'로 '전문가 해설'을 비동기로 조회합니다.
    """
    if not db_pool:
        logger.error("오류: DB 풀이 초기화되지 않았습니다.")
        raise HTTPException(status_code=503, detail="데이터베이스 연결이 준비되지 않았습니다.")
    
    sql = "SELECT interpretation_text FROM interpretations WHERE aspect_key = %s"
    
    try:
        async with db_pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(sql, (driver_key,))
                result = await cursor.fetchone()
        
        if result:
            return result['interpretation_text']
        else:
            logger.info(f"FastAPI: '{driver_key}'에 대한 해설이 없어 DEFAULT 조회")
            async with db_pool.acquire() as conn:
                async with conn.cursor(aiomysql.DictCursor) as cursor:
                    await cursor.execute(sql, ("DEFAULT_POSITIVE",))
                    result_default = await cursor.fetchone()
            
            return result_default['interpretation_text'] if result_default else "오늘 하루도 순조롭게 보낼 수 있습니다."
    
    except Exception as e:
        logger.error(f"FastAPI: DB 쿼리 중 오류 발생: {e}")
        return "운세 해설을 가져오는 중 오류가 발생했습니다."


# --- RAG 서비스 로직 (LLM 생성) ---

async def generate_summary(score: int, expert_text: str, category: str) -> str:
    """
    [RAG - Generation] (실제 OpenAI 호출)
    LLM(OpenAI)을 호출하여 '전문가 해설'을 '최종 요약'으로 변환합니다.
    """
    system_prompt = f"""
    당신은 점성술 데이터를 바탕으로 사용자에게 친절한 조언을 해주는 요약 봇입니다.
    점성술 용어(행성, 하우스, 어스펙트)를 절대 사용하지 마세요.
    내가 제공하는 '점수'와 '전문가 해설'을 조합하여, 부드러운 한국어 1문장 요약으로 생성하세요.
    """
    user_prompt = f"""
    - 영역: {category}
    - 점수: {score} / 250
    - 전문가 해설: {expert_text}

    위 내용을 바탕으로 1문장 요약:
    """
    
    try:
        completion = await async_client.chat.completions.create(
            model=settings.GMS_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=150
        )
        summary = completion.choices[0].message.content.strip()
        return summary
    except Exception as e:
        logger.error(f"OpenAI API 호출 오류 (영역: {category}): {e}")
        return f"오늘의 {category} 운세에 대한 정보를 가져오는 데 실패했습니다."

async def generate_total_summary(summaries: Dict[str, str]) -> str:
    """
    [RAG - Generation] (신규)
    모든 영역별 요약을 바탕으로 '오늘의 총 운세 요약'을 생성합니다.
    """
    system_prompt = "당신은 제공된 4가지 운세 영역 요약을 바탕으로, 전체를 아우르는 '오늘의 총 운세 요약'을 1문장으로 생성하는 전문 요약 봇입니다."
    
    formatted_summaries = "\n".join(f"- {key}: {value}" for key, value in summaries.items())
    user_prompt = f"""
    [영역별 요약]
    {formatted_summaries}

    [지시]
    위 4가지 요약을 바탕으로, 가장 중요한 핵심을 짚어 '오늘의 총 운세 요약' 1문장을 생성하세요.
    """
    
    try:
        completion = await async_client.chat.completions.create(
            model=settings.GMS_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=150
        )
        summary = completion.choices[0].message.content.strip()
        return summary
    except Exception as e:
        logger.error(f"OpenAI API 총 요약 생성 오류: {e}")
        return "오늘 하루 긍정적인 마음으로 기회를 잡아보세요."


# --- API 엔드포인트 ---

@app.post("/summarize", response_model=FortuneScoreResponse)
async def summarize_fortune(input_data: ScoreInput):
    """
    Java 엔진으로부터 점수와 핵심 근거를 받아,
    MySQL RAG DB + LLM을 통해 최종 요약을 생성합니다.
    """
    # print(f"FastAPI: Java로부터 요청 받음: {input_data.model_dump_json(indent=2)}")
    
    scores = input_data.scores
    drivers = input_data.keyDrivers
    
    retrieval_tasks = []
    categories = list(scores.keys()) # (love, health, money, achievement)
    
    for category in categories:
        driver_key = drivers.get(category, "DEFAULT_POSITIVE")
        retrieval_tasks.append(get_interpretation_from_db(driver_key))
    
    # asyncio.gather를 사용해 모든 DB 조회를 동시에 실행
    expert_texts = await asyncio.gather(*retrieval_tasks) # ["해설1", "해설2", ...]
    # print(f"FastAPI: RAG DB 조회 완료. 해설: {expert_texts}")

    # --- 2. [Generation] 각 영역별 '요약'을 병렬로 생성 ---
    summary_tasks = []
    for i, category in enumerate(categories):
        score = scores[category]
        expert_text = expert_texts[i]
        summary_tasks.append(generate_summary(score, expert_text, category))
        
    # asyncio.gather를 사용해 모든 LLM 호출을 동시에 실행
    detailed_summary_list = await asyncio.gather(*summary_tasks) # ["요약1", "요약2", ...]
    # print(f"FastAPI: LLM 개별 요약 생성 완료.")
    
    detailed_summaries = dict(zip(categories, detailed_summary_list))

    # --- 3. [Generation] '총 운세 요약' 생성 ---
    total_summary = await generate_total_summary(detailed_summaries)
    # print(f"FastAPI: LLM 총 요약 생성 완료.")

    # --- 4. 최종 응답 조립 ---
    total_score = sum(scores.values())
    
    response_data = FortuneScoreResponse(
        total_score=total_score,
        love=scores["love"],
        health=scores["health"],
        money=scores["money"],
        achievement=scores["achievement"],
        total_summary=total_summary,
        detailed_summaries=detailed_summaries
    )
    
    # print(f"FastAPI: Java로 최종 응답 전송: {response_data.model_dump_json(indent=2)}")
    
    return response_data

if __name__ == "__main__":
    # 터미널에서 실행: uvicorn Ai_Fortune:app --reload --port 8000
    logger.info("FastAPI server start")
    uvicorn.run("Ai_Fortune:app", host=settings.SERVER_HOST, port=settings.SERVER_HOST, reload=True)