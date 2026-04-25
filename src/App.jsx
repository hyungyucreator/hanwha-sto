import { useState, useEffect } from "react";

const C = {
  orange: "#FF6B00",
  orangeDim: "#FF6B0012",
  orangeBorder: "#FF6B0030",
  bg: "#F7F8FA",
  white: "#FFFFFF",
  text: "#0D0D0D",
  textMid: "#3D3D3D",
  textDim: "#7A7A7A",
  border: "#E4E6EA",
  green: "#16A34A",
  greenBg: "#F0FDF4",
  greenBorder: "#BBF7D0",
  yellow: "#CA8A04",
  yellowBg: "#FEFCE8",
  yellowBorder: "#FEF08A",
  red: "#DC2626",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
  inputBg: "#FAFBFC",
};

const ASSET_TYPES = [
  {
    id: "realestate", label: "부동산", icon: "🏢", desc: "상업용 건물, 물류센터, 오피스 등",
    fields: [
      { key: "location", label: "소재지", placeholder: "서울 강남구 역삼동" },
      { key: "area", label: "연면적", placeholder: "8,200", unit: "㎡" },
      { key: "tenant", label: "임차 현황", placeholder: "대형 e커머스 업체 2곳, 잔여 계약 3년" },
      { key: "income", label: "월 임대수익", placeholder: "5,000", unit: "만원" },
      { key: "appraisal", label: "감정평가액", placeholder: "150", unit: "억원" },
    ],
  },
  {
    id: "defense", label: "방산·인프라", icon: "⚙️", desc: "방산 공급망 채권, 인프라 현금흐름 등",
    fields: [
      { key: "issuer", label: "발행사 / 채무자", placeholder: "국내 방산 1차 협력사 컨소시엄 5개사" },
      { key: "contractType", label: "계약 유형", placeholder: "방산 납품 대금 채권, 장기 공급 계약 기반" },
      { key: "creditRating", label: "신용등급", placeholder: "협력사 평균 BBB+ (한국신용평가 기준)" },
      { key: "cashflow", label: "현금흐름 구조", placeholder: "납품 대금 회수 후 반기별 이자 지급" },
      { key: "govDependency", label: "정부 예산 의존도", placeholder: "방산 예산 직접 연동, 계약 물량 고정 여부" },
    ],
  },
  {
    id: "ip", label: "IP·콘텐츠", icon: "🎵", desc: "음원 저작권, K-콘텐츠 IP, 특허 등",
    fields: [
      { key: "ipType", label: "IP 유형 및 수량", placeholder: "K-드라마 OST 음원 저작권 23개 타이틀" },
      { key: "revenueSource", label: "수익원", placeholder: "글로벌 스트리밍 정산, 해외 방송 판권, 공연 로열티" },
      { key: "annualRevenue", label: "연간 저작권료 (3년 평균)", placeholder: "4", unit: "억원" },
      { key: "growth", label: "시장 성장성", placeholder: "글로벌 K-팝 스트리밍 연 15% 성장, 해외 팬덤 확대" },
      { key: "rightsStructure", label: "권리 보유 구조", placeholder: "저작권료 청구권 신탁 구조, SPC 수익 분배" },
    ],
  },
  {
    id: "credit", label: "매출채권·사모", icon: "📄", desc: "중소기업 매출채권, 사모 펀드 LP 지분 등",
    fields: [
      { key: "debtorType", label: "채무자 유형", placeholder: "중소 제조기업 매출채권 포트폴리오 (50개사)" },
      { key: "maturity", label: "만기 구조", placeholder: "평균 6개월 회전, 최장 12개월 단기물 중심" },
      { key: "delinquency", label: "연체율", placeholder: "최근 3년 평균 0.8%, 최고 1.2% (2023년)" },
      { key: "collateral", label: "담보·보증 구조", placeholder: "신용보증기금 보증 80%, 자체 담보 20%" },
      { key: "size", label: "포트폴리오 총 규모", placeholder: "200", unit: "억원" },
    ],
  },
];

function buildSystemPrompt(assetType) {
  const typeLabel = ASSET_TYPES.find(t => t.id === assetType)?.label || assetType;

  const expertCriteria = {
    realestate: [
      "NOI(순영업이익) 산출 가능 여부: 임대료에서 관리비·세금·공실 손실 차감 후 안정적 NOI가 확보되는가. 임차인의 실제 신용등급·재무건전성으로 배당 지속성을 판단할 것.",
      "Cap Rate 적정성: 해당 지역·자산군 시장 Cap Rate 대비 제시 수익률이 과도하게 높거나 낮지 않은지 검토. 임대차 계약 잔여 기간이 STO 만기보다 짧을 경우 공실 리스크가 만기 내 현실화될 수 있음.",
      "감정평가액 기준 LTV 수준: 공모 규모가 감정가의 70% 초과 시 가격 하락 완충력 부족. 감정평가 기관 신뢰도 및 최근 평가일 확인 (2년 초과 시 재평가 필요).",
      "수탁자(신탁사) 선임 여부 및 신탁계약 구조 명확성. 수익증권 발행 시 기초자산 분리보관 가능 여부 (도산절연 구조) 확인 필요.",
      "해당 자산 유형·지역에 대한 기관 및 리테일 투자자 선호도. 유사 조각투자 상품의 청약률 및 2차 거래 활성화 수준 참고."
    ],
    defense: [
      "납품 대금의 법적 청구권 이전(채권양도) 가능 여부 및 채무자(발주처)의 사전 동의 취득 여부 확인. 납품 완료 후 대금 지급까지의 평균 결제일(DSO)이 60일 초과 시 유동성 리스크 증가.",
      "단순 정부 예산 연동이 아닌 방위사업청 계약 번호·계약 잔액 확인 가능 여부. 발주처(정부·방산 대기업)의 지급보증 여부가 협력사 자체 신용등급보다 핵심 지표.",
      "특정 발주처 1곳 의존도 70% 초과 시 집중 리스크 경고. 납품 지연·계약 변경 시 채권 회수에 미치는 연쇄 영향 시나리오 검토 필요.",
      "방산물자 수출통제(ITAR 등) 적용 여부가 구조 복잡성에 미치는 영향. 이행보증보험 등 계약 이행 보증 수단 존재 여부 확인.",
      "방산 공급망 구조 특성상 일반 투자자의 리스크 이해가 어려움. 투자설명서 작성 난이도 및 금감원 심사 기간 예상 필요."
    ],
    ip: [
      "과거 3년 저작권료 수취 실적의 변동성: 연도별 편차가 30% 초과 시 배당 안정성 우려. 스트리밍 수익의 경우 플랫폼별 정산 주기와 STO 배당 주기 일치 여부 확인.",
      "수익원이 단일 플랫폼 집중도 70% 초과 시 플랫폼 정책 변경 리스크 발생 가능. 해외 수익 비중이 30% 초과 시 환헤지 수단 적용 여부 검토.",
      "저작인격권·저작재산권 분리 여부 확인 — 재산권만 신탁 가능. 공동 저작물인 경우 공동저작권자 전원 동의 취득 여부 및 원저작자의 계약 해지 가능성(저작권법 제45조) 검토 필수.",
      "DCF 적용 시 할인율 및 잔존 수익 기간 설정의 합리성 검토. 음원의 경우 등록 후 경과 연수에 따른 수익 감소 곡선(Long-tail) 반영 여부 확인.",
      "해당 IP의 팬덤 지속성 지표(스트리밍 재생 추이, SNS 언급량 변화) 분석. 후속 콘텐츠·시즌 제작 계획 여부가 수익 지속성에 미치는 영향 평가."
    ],
    credit: [
      "채무자 집중도: 상위 3개 채무자 비중이 50% 초과 시 집중 리스크 경고. 실제 연체율과 업계 평균(0.5~1.5%) 비교 및 업종 편중 리스크 평가.",
      "채권 회수 주체(자산관리자·신탁사)의 추심 권한 및 실적 확인. 부실 채권 발생 시 대체 자산 편입(풀 방식) 또는 조기 상환 트리거 조건 명시 여부.",
      "신용보증기금 보증의 경우 보증 한도·보증료율·보증 조건(부분보증 여부) 확인. 담보 자산의 처분 용이성 및 경매 소요 기간(평균 8~14개월) 고려.",
      "기초자산(매출채권) 평균 만기 vs STO 만기 간 갭 — 롤오버 리스크 평가. 조기상환 청구권(Put option) 부여 여부 및 행사 조건 검토.",
      "사모 LP 지분의 경우 GP 트랙레코드 및 펀드 잔존 기간 확인. LP 지분 양도 제한 조항 및 STO 유통 시장에서의 거래 허용 여부 법적 해석 선결 필요."
    ]
  };

  const criteriaArr = expertCriteria[assetType] || ["수익 구조 명확성 검토", "리스크 요인 분석", "투자자 이해 가능성 평가", "구조 설계 가능성 검토", "시장 수요 분석"];

  return `당신은 한화투자증권 STO 플랫폼 담당자를 보조하는 자산 스크리닝 AI입니다.
10년 이상 경력의 구조화금융 전문가 수준으로 분석하며, 표면적 정보가 아닌 실무적 리스크와 구조적 문제점을 짚어냅니다.
담당자가 본격적인 법무·신탁·감정평가 작업에 들어갈 가치가 있는지 1차로 판단해줍니다.
이 스크리닝은 최종 판단이 아닌 초기 필터입니다.

[자산 유형: ${typeLabel}]

[항목별 전문 평가 기준]
1. 수익 구조: ${criteriaArr[0]}
2. 리스크: ${criteriaArr[1]}
3. 법적·구조적 완결성: ${criteriaArr[2]}
4. 자산 가치 투명성: ${criteriaArr[3]}
5. 시장 수요: ${criteriaArr[4]}

응답 규칙:
- 순수 JSON만 반환 (마크다운, 코드블록 절대 금지)
- 모든 텍스트는 한국어
- 각 항목 comment는 입력된 실제 수치와 조건을 언급하며 전문가 수준으로 구체적으로 평가 (2~3문장)
- "확인 필요" 수준이 아닌 실무적 판단 근거를 포함할 것
- verdict는 반드시 "검토 권장", "조건부 검토", "보류 권장" 중 하나로 시작

{
  "verdict": "검토 권장 / 조건부 검토 / 보류 권장 중 하나로 시작한 1문장 판정",
  "verdictReason": "판정 핵심 근거 — 입력 정보 기반으로 가장 결정적인 요인 2문장",
  "checks": [
    { "label": "수익 구조", "status": "pass 또는 warn 또는 fail", "comment": "입력 수치 기반 구체적 평가 2~3문장" },
    { "label": "리스크", "status": "pass 또는 warn 또는 fail", "comment": "입력 수치 기반 구체적 평가 2~3문장" },
    { "label": "법적·구조적 완결성", "status": "pass 또는 warn 또는 fail", "comment": "신탁·도산절연·권리 구조 평가 2~3문장" },
    { "label": "자산 가치 투명성", "status": "pass 또는 warn 또는 fail", "comment": "가치 산정 근거 및 신뢰성 평가 2~3문장" },
    { "label": "시장 수요", "status": "pass 또는 warn 또는 fail", "comment": "투자자 수요 및 유통 가능성 평가 2~3문장" }
  ],
  "keyQuestions": [
    "법무·신탁·감정평가 착수 전 반드시 확인해야 할 핵심 질문 1 (구체적 서류·수치 요청 포함)",
    "법무·신탁·감정평가 착수 전 반드시 확인해야 할 핵심 질문 2 (구체적 서류·수치 요청 포함)",
    "법무·신탁·감정평가 착수 전 반드시 확인해야 할 핵심 질문 3 (구체적 서류·수치 요청 포함)"
  ]
}`;
}


async function runScreening(assetType, assetName, issuerName, targetSize, freeText, fieldValues) {
  const typeLabel = ASSET_TYPES.find(t => t.id === assetType)?.label;
  const fieldLines = Object.entries(fieldValues)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => {
      const field = ASSET_TYPES.find(t => t.id === assetType)?.fields.find(f => f.key === k);
      return `${field?.label || k}: ${v}${field?.unit ? " " + field.unit : ""}`;
    }).join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system: buildSystemPrompt(assetType),
      messages: [{ role: "user", content: `[자산 정보]\n자산명: ${assetName || "미입력"}\n소유자/발행사: ${issuerName || "미입력"}\n발행 희망 규모: ${targetSize ? targetSize + " 억원" : "미입력"}\n자산 유형: ${typeLabel}\n\n${fieldLines}\n\n${freeText ? "[추가 정보]\n" + freeText : ""}\n\n위 정보를 바탕으로 STO 1차 스크리닝을 진행해주세요.` }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("JSON not found");
  return JSON.parse(text.slice(s, e + 1));
}

// ── 공통 컴포넌트 (App 밖에 정의) ──────────────────────────────────────────

function StatusIcon({ status }) {
  if (status === "pass") return <span style={{ color: C.green, fontSize: "14px" }}>✓</span>;
  if (status === "warn") return <span style={{ color: C.yellow, fontSize: "14px" }}>△</span>;
  return <span style={{ color: C.red, fontSize: "14px" }}>✕</span>;
}

function VerdictBadge({ verdict }) {
  const isPass = verdict?.startsWith("검토 권장");
  const isWarn = verdict?.startsWith("조건부");
  const color = isPass ? C.green : isWarn ? C.yellow : C.red;
  const bg = isPass ? C.greenBg : isWarn ? C.yellowBg : C.redBg;
  const border = isPass ? C.greenBorder : isWarn ? C.yellowBorder : C.redBorder;
  const label = isPass ? "검토 권장" : isWarn ? "조건부 검토" : "보류 권장";
  return <span style={{ fontSize: "12px", fontWeight: "700", color, background: bg, border: `1px solid ${border}`, padding: "4px 12px", borderRadius: "20px" }}>{label}</span>;
}

function Skeleton({ h = 14, w = "100%", mb = 8 }) {
  return <div style={{ height: h, width: w, marginBottom: mb, borderRadius: "4px", background: "linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />;
}

function FieldLabel({ children, required }) {
  return (
    <div style={{ fontSize: "12px", fontWeight: "600", color: C.textMid, marginBottom: "6px" }}>
      {children}{required && <span style={{ color: C.orange, marginLeft: "2px" }}>*</span>}
    </div>
  );
}

function InputWithUnit({ value, onChange, placeholder, unit }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", background: C.inputBg, border: `1px solid ${focused ? C.orange : C.border}`, borderRadius: "6px", overflow: "hidden", transition: "border-color 0.15s" }}>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "9px 12px", fontSize: "13px", color: C.text, fontFamily: "inherit", height: "38px" }}
      />
      <div style={{ padding: "0 12px", fontSize: "12px", fontWeight: "600", color: C.textDim, background: "#F0F1F4", borderLeft: `1px solid ${C.border}`, height: "38px", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>{unit}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline }) {
  const [focused, setFocused] = useState(false);
  const base = { width: "100%", background: C.inputBg, border: `1px solid ${focused ? C.orange : C.border}`, borderRadius: "6px", fontSize: "13px", color: C.text, outline: "none", fontFamily: "inherit", resize: "none", transition: "border-color 0.15s" };
  if (multiline) return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...base, padding: "10px 12px" }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />;
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, padding: "9px 12px", height: "38px" }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />;
}

// ── InputForm (App 밖에 정의 — 핵심 수정) ──────────────────────────────────
function InputForm({ assetType, onTypeChange, assetName, onAssetName, issuerName, onIssuerName, targetSize, onTargetSize, freeText, onFreeText, fieldValues, onFieldChange, isMobile }) {
  const currentType = ASSET_TYPES.find(t => t.id === assetType);
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "20px 16px 16px" : "28px 24px 16px" }}>
      {/* 자산 유형 */}
      <div style={{ marginBottom: "20px" }}>
        <FieldLabel required>자산 유형</FieldLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {ASSET_TYPES.map(t => (
            <div key={t.id} onClick={() => onTypeChange(t.id)} style={{ padding: "10px 12px", borderRadius: "8px", cursor: "pointer", background: assetType === t.id ? "#FFF7F2" : C.inputBg, border: `1px solid ${assetType === t.id ? C.orange : C.border}`, transition: "all 0.15s" }}>
              <div style={{ fontSize: "16px", marginBottom: "3px" }}>{t.icon}</div>
              <div style={{ fontSize: "12px", fontWeight: "700", color: assetType === t.id ? C.orange : C.text }}>{t.label}</div>
              <div style={{ fontSize: "11px", color: C.textDim, marginTop: "2px", lineHeight: "1.4" }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 기본 정보 */}
      <div style={{ marginBottom: "18px" }}>
        <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px", paddingBottom: "8px", borderBottom: `1px solid ${C.border}` }}>기본 정보</div>
        <div style={{ marginBottom: "10px" }}><FieldLabel required>자산명</FieldLabel><TextInput value={assetName} onChange={onAssetName} placeholder="자산명을 입력하세요" /></div>
        <div style={{ marginBottom: "10px" }}><FieldLabel>소유자 / 발행사</FieldLabel><TextInput value={issuerName} onChange={onIssuerName} placeholder="자산 소유자 또는 발행사명" /></div>
        <div><FieldLabel>발행 희망 규모</FieldLabel><InputWithUnit value={targetSize} onChange={onTargetSize} placeholder="100" unit="억원" /></div>
      </div>

      {/* 세부 정보 */}
      <div style={{ marginBottom: "18px" }}>
        <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px", paddingBottom: "8px", borderBottom: `1px solid ${C.border}` }}>
          {currentType?.label} 세부 정보<span style={{ fontSize: "10px", color: C.orange, fontWeight: "600", marginLeft: "6px" }}>1개 이상 필수</span>
        </div>
        {currentType?.fields.map(field => (
          <div key={field.key} style={{ marginBottom: "10px" }}>
            <FieldLabel>{field.label}</FieldLabel>
            {field.unit
              ? <InputWithUnit value={fieldValues[field.key] || ""} onChange={v => onFieldChange(field.key, v)} placeholder={field.placeholder} unit={field.unit} />
              : <TextInput value={fieldValues[field.key] || ""} onChange={v => onFieldChange(field.key, v)} placeholder={field.placeholder} />
            }
          </div>
        ))}
      </div>

      {/* 추가 정보 */}
      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px", paddingBottom: "8px", borderBottom: `1px solid ${C.border}` }}>
          추가 정보 <span style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>(선택)</span>
        </div>
        <TextInput value={freeText} onChange={onFreeText} placeholder="특이사항, 발행사가 전달한 내용, 담당자 메모 등" multiline />
      </div>
    </div>
  );
}

// ── ResultContent (App 밖에 정의) ───────────────────────────────────────────
function ResultContent({ result, assetType, resultAssetName, onReset, isMobile }) {
  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "11px", color: C.textDim, marginBottom: "3px" }}>{ASSET_TYPES.find(t => t.id === assetType)?.label} · 스크리닝 결과</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: C.text }}>{resultAssetName}</div>
          </div>
          <button onClick={onReset} style={{ padding: "8px 16px", background: C.white, border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", fontWeight: "600", color: C.textMid, cursor: "pointer" }}>↺ 새 자산 입력</button>
        </div>
      )}

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>종합 판정</span>
          <VerdictBadge verdict={result.verdict} />
        </div>
        <div style={{ fontSize: "14px", color: C.text, fontWeight: "600", lineHeight: "1.6", marginBottom: "6px" }}>{result.verdict}</div>
        <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.8" }}>{result.verdictReason}</div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>항목별 검토</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {result.checks?.map((check, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 12px", borderRadius: "8px", background: check.status === "pass" ? C.greenBg : check.status === "warn" ? C.yellowBg : C.redBg, border: `1px solid ${check.status === "pass" ? C.greenBorder : check.status === "warn" ? C.yellowBorder : C.redBorder}` }}>
              <StatusIcon status={check.status} />
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: C.text, marginBottom: "2px" }}>{check.label}</div>
                <div style={{ fontSize: "12px", color: C.textMid, lineHeight: "1.6" }}>{check.comment}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>본격 검토 전 확인 사항</div>
        <div style={{ fontSize: "12px", color: C.textDim, marginBottom: "14px" }}>법무·신탁·감정평가 진행 전 자산 소유자에게 확인해야 할 핵심 질문입니다.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {result.keyQuestions?.map((q, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0, background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: C.orange }}>{i + 1}</div>
              <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.7", paddingTop: "2px" }}>{q}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: "14px", fontSize: "11px", color: C.textDim, lineHeight: "1.6" }}>※ 본 스크리닝은 AI 기반 1차 필터링 결과입니다. 최종 발행 적합성은 법무·신탁·감정평가 전문가의 검토를 통해 확정됩니다.</div>
    </div>
  );
}

// ── 메인 App ────────────────────────────────────────────────────────────────
export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [assetType, setAssetType] = useState("realestate");
  const [assetName, setAssetName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [targetSize, setTargetSize] = useState("");
  const [freeText, setFreeText] = useState("");
  const [fieldValues, setFieldValues] = useState({});
  const [result, setResult] = useState(null);
  const [resultAssetName, setResultAssetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileScreen, setMobileScreen] = useState("input");

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const hasFieldInput = Object.values(fieldValues).some(v => v.trim());
  const canSubmit = assetName.trim() && hasFieldInput;

  const handleTypeChange = (id) => { setAssetType(id); setFieldValues({}); setResult(null); setError(""); };
  const handleFieldChange = (key, value) => setFieldValues(prev => ({ ...prev, [key]: value }));

  const handleRun = async () => {
    if (!canSubmit) { setError("자산명과 세부 정보를 최소 1개 이상 입력해주세요."); return; }
    setLoading(true); setError(""); setResult(null); setResultAssetName(assetName);
    try {
      const r = await runScreening(assetType, assetName, issuerName, targetSize, freeText, fieldValues);
      setResult(r);
      if (isMobile) setMobileScreen("result");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null); setError("");
    setAssetName(""); setIssuerName(""); setTargetSize(""); setFreeText(""); setFieldValues({}); setResultAssetName("");
  };

  const submitBtn = (padding = "13px 24px") => (
    <button onClick={handleRun} disabled={loading || !canSubmit} style={{
      width: "100%", padding,
      background: loading ? "#FFB380" : !canSubmit ? "#E8E9EC" : C.orange,
      color: !canSubmit ? C.textDim : "#fff",
      border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700",
      cursor: loading || !canSubmit ? "default" : "pointer", transition: "all 0.2s",
    }}>
      {loading ? "스크리닝 중..." : "스크리닝 시작 →"}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR','Apple SD Gothic Neo',sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
        textarea::placeholder,input::placeholder{color:#C0C2C8}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#ddd;border-radius:2px}
      `}</style>

      {/* 헤더 */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "4px", height: "26px", background: C.orange, borderRadius: "2px" }} />
          <div>
            <div style={{ fontSize: "10px", color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase" }}>Hanwha Investment Securities</div>
            <div style={{ fontSize: isMobile ? "13px" : "15px", fontWeight: "700", color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>STO 자산 스크리닝 툴</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.orange, boxShadow: `0 0 8px ${C.orange}80` }} />
          {!isMobile && <span style={{ fontSize: "11px", color: C.textDim }}>AI 보조 · 담당자 전용</span>}
        </div>
      </div>

      {/* ── 데스크탑 ── */}
      {!isMobile && (
        <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
          <div style={{ width: "420px", flexShrink: 0, background: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100%" }}>
            <InputForm
              assetType={assetType} onTypeChange={handleTypeChange}
              assetName={assetName} onAssetName={setAssetName}
              issuerName={issuerName} onIssuerName={setIssuerName}
              targetSize={targetSize} onTargetSize={setTargetSize}
              freeText={freeText} onFreeText={setFreeText}
              fieldValues={fieldValues} onFieldChange={handleFieldChange}
              isMobile={false}
            />
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, background: C.white, boxShadow: "0 -4px 12px rgba(0,0,0,0.06)" }}>
              {error && <div style={{ padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "6px", fontSize: "12px", color: "#DC2626", marginBottom: "10px" }}>{error}</div>}
              {submitBtn()}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
            {loading && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
                  <div style={{ width: "18px", height: "18px", border: `2px solid ${C.border}`, borderTop: `2px solid ${C.orange}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <span style={{ fontSize: "13px", color: C.textDim }}>자산 정보를 분석하고 있습니다...</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  {[1,2,3,4].map(i => <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "18px" }}><Skeleton h={10} w="50%" mb={12} /><Skeleton h={12} mb={6} /><Skeleton h={12} w="75%" mb={0} /></div>)}
                </div>
              </div>
            )}
            {result && !loading && <ResultContent result={result} assetType={assetType} resultAssetName={resultAssetName} onReset={handleReset} isMobile={false} />}
            {!result && !loading && !error && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "18px" }}>✦</div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: C.textMid, marginBottom: "8px" }}>자산 정보를 입력하고 스크리닝을 시작하세요</div>
                <div style={{ fontSize: "13px", color: C.textDim, lineHeight: "1.8", maxWidth: "360px" }}>자산 유형별 기준에 따라 수익 구조·리스크·투자자 이해 가능성·구조 설계 가능성·시장 수요를 분석합니다.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 모바일 ── */}
      {isMobile && (
        <div style={{ height: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
          {mobileScreen === "input" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <InputForm
                assetType={assetType} onTypeChange={handleTypeChange}
                assetName={assetName} onAssetName={setAssetName}
                issuerName={issuerName} onIssuerName={setIssuerName}
                targetSize={targetSize} onTargetSize={setTargetSize}
                freeText={freeText} onFreeText={setFreeText}
                fieldValues={fieldValues} onFieldChange={handleFieldChange}
                isMobile={true}
              />
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, background: C.white, boxShadow: "0 -4px 12px rgba(0,0,0,0.06)" }}>
                {error && <div style={{ padding: "8px 12px", background: "#FEF2F2", border: `1px solid ${C.redBorder}`, borderRadius: "6px", fontSize: "12px", color: C.red, marginBottom: "10px" }}>{error}</div>}
                {submitBtn("13px")}
              </div>
            </div>
          )}

          {mobileScreen === "result" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ padding: "12px 16px", background: C.white, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <div style={{ fontSize: "10px", color: C.textDim, marginBottom: "2px" }}>{ASSET_TYPES.find(t => t.id === assetType)?.label} · 스크리닝 결과</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: C.text }}>{resultAssetName}</div>
                </div>
                <button onClick={handleReset} style={{ padding: "6px 12px", background: C.white, border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: C.textMid, cursor: "pointer" }}>↺ 다시</button>
              </div>

              {loading && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                  <div style={{ width: "24px", height: "24px", border: `2px solid ${C.border}`, borderTop: `2px solid ${C.orange}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <span style={{ fontSize: "13px", color: C.textDim }}>분석 중입니다...</span>
                </div>
              )}
              {result && !loading && (
                <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                  <ResultContent result={result} assetType={assetType} resultAssetName={resultAssetName} onReset={handleReset} isMobile={true} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
