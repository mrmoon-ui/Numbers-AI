
import { GoogleGenAI, Type } from "@google/genai";
import { CorrectionResult } from "../types";

// Strict initialization per documentation rules
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT_STUDIO = `
당신은 '블로터(Bloter)'와 '넘버스(Numbers)'의 편집국장입니다. 
당신의 임무는 제출된 기사를 세 가지 차원에서 완벽하게 다듬는 것입니다.

[편집의 3대 원칙]
1. 교정(proofreading): 오탈자, 띄어쓰기, 문장 부호 등 기본적인 오류 수정.
2. 교열(editing): 논리적 모순 제거, 주어-서술어 호응, 비문 수정, 불필요한 중복 표현 삭제.
3. 윤문(refining): 기사의 톤앤매너 개선, 전문 용어의 순화, 문장의 리듬감과 가독성 향상.

[중요 지침]
- 브랜드 명칭: 한국어 표기 시 반드시 "넘버스"(Numbers)를 사용하십시오. "넘버즈"는 절대 금지입니다.
- 출처(Source) 명시: 각 수정 사항에 대해 반드시 근거를 제시하십시오. 
  (예: '블로터 스타일북 제1조', '국립국어원 표준어 규정', '경제 기사 작성 원칙', '문맥상 가독성 개선' 등)
- 데이터 기반: 제공된 [CUSTOM STYLEBOOK RULES]를 최우선으로 적용하십시오.

결과는 반드시 지정된 JSON 스키마 형식으로 출력하십시오.
`;

export const processArticleStudio = async (content: string, stylebook: string): Promise<CorrectionResult & { citations?: any[] }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `[CUSTOM STYLEBOOK RULES]\n${stylebook}\n\n[ARTICLE CONTENT TO PROCESS]\n${content}`,
    config: {
      systemInstruction: SYSTEM_PROMPT_STUDIO,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          corrected: { type: Type.STRING, description: "수정이 완료된 전체 기사 본문" },
          explanations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { 
                  type: Type.STRING, 
                  description: "반드시 '교정', '교열', '윤문' 중 하나를 선택하십시오."
                },
                target: { type: Type.STRING, description: "수정 전의 원문 텍스트" },
                change: { type: Type.STRING, description: "수정 후의 텍스트" },
                reason: { type: Type.STRING, description: "편집 이유에 대한 상세 설명" },
                source: { type: Type.STRING, description: "수정의 근거가 된 규칙이나 출처 (예: 스타일북 규칙 번호 등)" },
              },
              required: ["type", "target", "change", "reason", "source"]
            }
          }
        },
        required: ["corrected", "explanations"]
      }
    },
  });

  const text = response.text;
  if (!text) throw new Error("AI가 응답을 생성하지 못했습니다.");
  
  const parsed = JSON.parse(text);
  const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return { ...parsed, citations };
};

export const suggestTitles = async (input: string, mode: 'PRE' | 'POST', stylebook: string, tone: string): Promise<{ titles: string[], citations?: any[] }> => {
  const context = mode === 'PRE' ? '기사 작성 전 아이디어/키워드' : '기사 작성 후 완성된 본문';
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `스타일북 참조: ${stylebook}\n\n입력 단계: ${context}\n내용: ${input}\n요청된 톤: ${tone}`,
    config: {
      systemInstruction: `입력된 내용을 바탕으로 전문적인 뉴스 제목 5개를 제안하십시오.
      규칙:
      1. 길이: 각 제목은 공백 포함 39자 이내여야 합니다.
      2. 명칭: 'Numbers'는 반드시 '넘버스'로 표기하십시오.
      3. 단계별 최적화: 
         - '기사 작성 전'인 경우 궁금증을 유발하고 핵심 키워드를 강조하십시오.
         - '기사 작성 후'인 경우 본문의 핵심 결론을 명확히 전달하십시오.
      결과는 문자열 배열 형태의 JSON으로 출력하십시오.`,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
  });

  const text = response.text;
  if (!text) return { titles: [], citations: [] };

  return {
    titles: JSON.parse(text),
    citations: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
