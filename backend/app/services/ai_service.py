from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
import google.generativeai as genai
from app.core.config import settings
from app.models import Kid, Record, MealRecord, SleepRecord, HealthRecord, GrowthRecord


class AIService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def get_system_prompt(self, ai_mode: str, kid_context: Optional[str] = None) -> str:
        base_prompts = {
            "doctor": """당신은 소아과 전문의 AI 어시스턴트입니다.
- 아이의 건강 관련 질문에 전문적이고 친절하게 답변합니다.
- 증상에 대한 일반적인 정보와 조언을 제공합니다.
- 심각한 증상이나 응급 상황의 경우 반드시 병원 방문을 권고합니다.
- 의학적 진단이나 처방은 하지 않으며, 일반적인 건강 정보만 제공합니다.""",

            "mom": """당신은 경험 많은 육아 전문가 AI 어시스턴트입니다.
- 육아에 관한 다양한 질문에 따뜻하고 공감하는 태도로 답변합니다.
- 아이의 발달 단계에 맞는 조언을 제공합니다.
- 부모의 걱정을 이해하고 실질적인 도움을 줍니다.
- 육아 스트레스 관리에 대한 조언도 제공합니다.""",

            "nutritionist": """당신은 소아 영양 전문가 AI 어시스턴트입니다.
- 아이의 영양과 식단에 관한 질문에 전문적으로 답변합니다.
- 연령별 적절한 영양 섭취량과 식단을 제안합니다.
- 편식, 알레르기, 이유식 등에 대한 조언을 제공합니다.
- 건강한 식습관 형성을 위한 팁을 제공합니다."""
        }

        system_prompt = base_prompts.get(ai_mode, base_prompts["mom"])

        if kid_context:
            system_prompt += f"\n\n[아이 정보]\n{kid_context}"

        system_prompt += "\n\n답변은 한국어로 작성하며, 친절하고 이해하기 쉽게 설명해주세요."

        return system_prompt

    def build_kid_context(self, kid: Kid, db: Session) -> str:
        """Build context string from kid's recent records for RAG-like approach"""
        context_parts = [f"- 이름: {kid.name}"]
        context_parts.append(f"- 생년월일: {kid.birth_date}")
        context_parts.append(f"- 성별: {'남아' if kid.gender == 'male' else '여아'}")

        # Recent growth (join through Record base table)
        recent_growth = db.query(GrowthRecord).join(Record).filter(
            Record.kid_id == kid.id
        ).options(joinedload(GrowthRecord.record)).order_by(Record.created_at.desc()).first()

        if recent_growth:
            if recent_growth.height_cm:
                context_parts.append(f"- 최근 키: {recent_growth.height_cm}cm")
            if recent_growth.weight_kg:
                context_parts.append(f"- 최근 체중: {recent_growth.weight_kg}kg")

        # Recent health issues (join through Record base table)
        recent_health = db.query(HealthRecord).join(Record).filter(
            Record.kid_id == kid.id
        ).options(joinedload(HealthRecord.record)).order_by(Record.created_at.desc()).limit(3).all()

        if recent_health:
            symptoms = []
            for health_record in recent_health:
                if health_record.symptom:
                    symptoms.append(health_record.symptom.value)
            if symptoms:
                context_parts.append(f"- 최근 증상: {', '.join(set(symptoms))}")

        # Recent sleep patterns (join through Record base table)
        recent_sleep = db.query(SleepRecord).join(Record).filter(
            Record.kid_id == kid.id
        ).options(joinedload(SleepRecord.record)).order_by(Record.created_at.desc()).limit(7).all()

        if recent_sleep:
            total_hours = 0
            for sleep_record in recent_sleep:
                duration = (sleep_record.end_datetime - sleep_record.start_datetime).total_seconds() / 3600
                total_hours += duration
            avg_sleep = total_hours / len(recent_sleep)
            context_parts.append(f"- 평균 수면시간: {avg_sleep:.1f}시간")

        return "\n".join(context_parts)

    async def generate_response(
        self,
        message: str,
        ai_mode: str,
        conversation_history: List[Dict[str, str]],
        kid: Optional[Kid] = None,
        db: Optional[Session] = None
    ) -> str:
        if not self.model:
            return "AI 서비스가 설정되지 않았습니다. 관리자에게 문의해주세요."

        # Build kid context if available
        kid_context = None
        if kid and db:
            kid_context = self.build_kid_context(kid, db)

        system_prompt = self.get_system_prompt(ai_mode, kid_context)

        # Build conversation for Gemini
        chat = self.model.start_chat(history=[])

        # Add system prompt as first message
        messages = [{"role": "user", "parts": [system_prompt]}]
        messages.append({"role": "model", "parts": ["네, 알겠습니다. 말씀하신 역할에 맞게 도움을 드리겠습니다."]})

        # Add conversation history
        for msg in conversation_history:
            role = "user" if msg["sender"] == "user" else "model"
            messages.append({"role": role, "parts": [msg["message"]]})

        # Add current message
        messages.append({"role": "user", "parts": [message]})

        try:
            # Create chat with history
            chat = self.model.start_chat(history=messages[:-1])
            response = chat.send_message(message)
            return response.text
        except Exception as e:
            return f"죄송합니다. 응답을 생성하는 중 오류가 발생했습니다: {str(e)}"


# Singleton instance
ai_service = AIService()
