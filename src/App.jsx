import { useState } from "react";

const C = {
  orange: "#FF6B00",
  orangeHover: "#E55F00",
  orangeDim: "#FF6B0012",
  orangeBorder: "#FF6B0030",
  bg: "#F7F8FA",
  white: "#FFFFFF",
  sidebar: "#FFFFFF",
  text: "#0D0D0D",
  textMid: "#3D3D3D",
  textDim: "#7A7A7A",
  border: "#E4E6EA",
  borderStrong: "#C8CAD0",
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
    id: "realestate",
    label: "부동산",
    icon: "🏢",
    desc: "상업용 건물, 물류센터, 오피스 등",
    fields: [
      { key: "location", label: "소재지", placeholder: "서울 강남구 역삼동" },
      { key: "area", label: "연면적", placeholder: "8,200", unit: "㎡", type: "number" },
      { key: "tenant", label: "임차 현황", placeholder: "대형 e커머스 업체 2곳, 잔여 계약 3년" },
      { key: "income", label: "월 임대수익", placeholder: "5,000", unit: "만원", type: "number" },
      { key: "appraisal", label: "감정평가액", placeholder: "150", unit: "억원", type: "number" },
    ],
  },
  {
    id: "defense",
    label: "방산·인프라",
    icon: "⚙️",
    desc: "방산 공급망 채권, 인프라 현금흐름 등",
    fields: [
      { key: "issuer", label: "발행사 / 채무자", placeholder: "국내 방산 1차 협력사 컨소시엄 5개사" },
      { key: "contractType", label: "계약 유형", placeholder: "방산 납품 대금 채권, 장기 공급 계약 기반" },
      { key: "creditRating", label: "신용등급", placeholder: "협력사 평균 BBB+ (한국신용평가 기준)" },
      { key: "cashflow", label: "현금흐름 구조", placeholder: "납품 대금 회수 후 반기별 이자 지급" },
      { key: "govDependency", label: "정부 예산 의존도", placeholder: "방산 예산 직접 연동, 계약 물량 고정 여부" },
    ],
  },
  {
    id: "ip",
    label: "IP·콘텐츠",
    icon: "🎵",
    desc: "음원 저작권, K-콘텐츠 IP, 특허 등",
    fields: [
      { key: "ipType", label: "IP 유형 및 수량", placeholder: "K-드라마 OST 음원 저작권 23개 타이틀" },
      { key: "revenueSource", label: "수익원", placeholder: "글로벌 스트리밍 정산, 해외 방송 판권, 공연 로열티" },
      { key: "annualRevenue", label: "연간 저작권료 (3년 평균)", placeholder: "4", unit: "억원", type: "number" },
      { key: "growth", label: "시장 성장성", placeholder: "글로벌 K-팝 스트리밍 연 15% 성장, 해외 팬덤 확대" },
      { key: "rightsStructure", label: "권리 보유 구조", placeholder: "저작권료 청구권 신탁 구조, SPC 수익 분배" },
    ],
  },
  {
    id: "credit",
    label: "매출채권·사모",
    icon: "📄",
    desc: "중소기업 매출채권, 사모 펀드 LP 지분 등",
    fields: [
      { key: "debtorType", label: "채무자 유형", placeholder: "중소 제조기업 매출채권 포트폴리오 (50개사)" },
      { key: "maturity", label: "만기 구조", placeholder: "평균 6개월 회전, 최장 12개월 단기물 중심" },
      { key: "delinquency", label: "연체율", placeholder: "최근 3년 평균 0.8%, 최고 1.2% (2023년)" },
      { key: "collateral", label: "담보·보증 구조", placeholder: "신용보증기금 보증 80%, 자체 담보 20%" },
      { key: "size", label: "포트폴리오 총 규모", placeholder: "200", unit: "억원", type: "number" },
    ],
  },
];

function buildSystemPrompt(assetType) {
  const typeLabel = ASSET_TYPES.find(t => t.id === assetType)?.label || assetType;
  const criteria = {
    realestate: "① 안정적 임대수익 여부 및 임차인 신용도 ② 임대차 계약 잔여 기간 ③ 감정가 대비 공모 규모 적정성 ④ 부동산 경기 민감도 ⑤ 신탁 구조 설계 가능성",
    defense: "① 발행사(채무자) 신용도 ② 계약 구조의 명확성과 정부 예산 의존도 ③ 채권 회수 구조의 확실성 ④ 방산 예산 변동 리스크 ⑤ 투자자 이해 가능성",
    ip: "① 수익원의 다양성과 안정성 ② 최근 3년 수익 추이 ③ 저작권 보유 구조의 명확성 ④ 시장 성장성 및 환율 리스크 ⑤ 투자계약증권 구조 적합성",
    credit: "① 채무자 포트폴리오 분산도 ② 연체율 및 회수 실적 ③ 담보·보증 구조 ④ 만기 구조의 적정성 ⑤ 투자자 이해 가능성",
  };
  return `당신은 한화투자증권 STO 플랫폼 담당자를 보조하는 자산 스크리닝 AI입니다.
담당자가 STO 발행 후보 자산을 검토할 때 본격적인 법무·신탁·감정평가 작업에 들어갈 가치가 있는지 1차로 판단해줍니다.

이 스크리닝은 최종 적합성 판단이 아닙니다. 담당자가 "본격 검토할지 말지"를 빠르게 결정할 수 있도록 돕는 초기 필터입니다.

[자산 유형: ${typeLabel}]
[스크리닝 기준]
${criteria[assetType] || "① 수익 구조 명확성 ② 리스크 요인 ③ 투자자 이해 가능성 ④ 구조 설계 가능성 ⑤ 시장 수요"}

응답 규칙:
- 순수 JSON만 반환 (마크다운, 코드블록 절대 금지)
- 모든 텍스트는 한국어
- 각 항목 2문장 이내 간결하게
- verdict는 반드시 "검토 권장", "조건부 검토", "보류 권장" 중 하나로 시작

{
  "verdict": "검토 권장 / 조건부 검토 / 보류 권장 중 하나로 시작한 1문장 판정",
  "verdictReason": "판정 핵심 근거 2문장",
  "checks": [
    { "label": "수익 구조", "status": "pass 또는 warn 또는 fail", "comment": "1문장 평가" },
    { "label": "리스크", "status": "pass 또는 warn 또는 fail", "comment": "1문장 평가" },
    { "label": "투자자 이해 가능성", "status": "pass 또는 warn 또는 fail", "comment": "1문장 평가" },
    { "label": "구조 설계 가능성", "status": "pass 또는 warn 또는 fail", "comment": "1문장 평가" },
    { "label": "시장 수요", "status": "pass 또는 warn 또는 fail", "comment": "1문장 평가" }
  ],
  "keyQuestions": [
    "본격 검토 시 담당자가 확인해야 할 핵심 질문 1",
    "본격 검토 시 담당자가 확인해야 할 핵심 질문 2",
    "본격 검토 시 담당자가 확인해야 할 핵심 질문 3"
  ]
}`;
}

async function runScreening(assetType, assetName, issuerName, targetSize, freeText, fieldValues) {
  const typeLabel = ASSET_TYPES.find(t => t.id === assetType)?.label;
  const fieldLines = Object.entries(fieldValues)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => {
      const field = ASSET_TYPES.find(t => t.id === assetType)?.fields.find(f => f.key === k);
      const unitSuffix = field?.unit ? ` ${field.unit}` : "";
      return `${field?.label || k}: ${v}${unitSuffix}`;
    }).join("\n");

  const userMessage = `[자산 정보]
자산명: ${assetName || "미입력"}
소유자/발행사: ${issuerName || "미입력"}
발행 희망 규모: ${targetSize ? targetSize + " 억원" : "미입력"}
자산 유형: ${typeLabel}

${fieldLines}

${freeText ? `[추가 정보]\n${freeText}` : ""}

위 정보를 바탕으로 STO 1차 스크리닝을 진행해주세요.`;

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
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));

  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error(`JSON not found: ${text.slice(0, 200)}`);
  return JSON.parse(text.slice(s, e + 1));
}

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
  return (
    <span style={{
      fontSize: "12px", fontWeight: "700", color,
      background: bg, border: `1px solid ${border}`,
      padding: "4px 12px", borderRadius: "20px", letterSpacing: "0.03em",
    }}>{label}</span>
  );
}

function Skeleton({ h = 14, w = "100%", mb = 8 }) {
  return (
    <div style={{
      height: h, width: w, marginBottom: mb, borderRadius: "4px",
      background: "linear-gradient(90deg,#eee 25%,#f5f5f5 50%,#eee 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
    }} />
  );
}

function Label({ children, required }) {
  return (
    <div style={{ fontSize: "12px", fontWeight: "600", color: C.textMid, marginBottom: "6px" }}>
      {children}{required && <span style={{ color: C.orange, marginLeft: "2px" }}>*</span>}
    </div>
  );
}

// 단위 고정 인풋 (우측에 단위 고정)
function InputWithUnit({ value, onChange, placeholder, unit }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: C.inputBg, border: `1px solid ${focused ? C.orange : C.border}`,
      borderRadius: "6px", overflow: "hidden", transition: "border-color 0.15s",
    }}>
      <input
        type="number"
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: "none", outline: "none",
          background: "transparent", padding: "9px 12px",
          fontSize: "13px", color: C.text, fontFamily: "inherit",
          height: "38px",
        }}
      />
      <div style={{
        padding: "0 12px", fontSize: "12px", fontWeight: "600",
        color: C.textDim, background: "#F0F1F4",
        borderLeft: `1px solid ${C.border}`, height: "38px",
        display: "flex", alignItems: "center", whiteSpace: "nowrap",
      }}>{unit}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, multiline }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: "100%", background: C.inputBg,
    border: `1px solid ${focused ? C.orange : C.border}`, borderRadius: "6px",
    fontSize: "13px", color: C.text, outline: "none",
    fontFamily: "inherit", resize: "none", transition: "border-color 0.15s",
  };
  if (multiline) return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={3}
      style={{ ...base, padding: "10px 12px" }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
  return (
    <input
      type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...base, padding: "9px 12px", height: "38px" }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export default function App() {
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

  const currentType = ASSET_TYPES.find(t => t.id === assetType);

  // 세부 필드 1개 이상 입력 여부
  const hasFieldInput = Object.values(fieldValues).some(v => v.trim());
  const canSubmit = assetName.trim() && hasFieldInput;

  const handleTypeChange = (id) => {
    setAssetType(id);
    setFieldValues({});
    setResult(null);
    setError("");
  };

  const handleFieldChange = (key, value) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  const handleRun = async () => {
    if (!canSubmit) {
      setError("자산명과 세부 정보를 최소 1개 이상 입력해주세요.");
      return;
    }
    setLoading(true); setError(""); setResult(null);
    setResultAssetName(assetName);
    try {
      const r = await runScreening(assetType, assetName, issuerName, targetSize, freeText, fieldValues);
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null); setError("");
    setAssetName(""); setIssuerName(""); setTargetSize(""); setFreeText(""); setFieldValues({});
    setResultAssetName("");
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
        textarea::placeholder,input::placeholder{color:#C0C2C8}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#ddd;border-radius:2px}
      `}</style>

      {/* 헤더 */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
        padding: "0 32px", height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "4px", height: "26px", background: C.orange, borderRadius: "2px" }} />
          <div>
            <div style={{ fontSize: "10px", color: C.textDim, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Hanwha Investment Securities
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              STO 자산 스크리닝 툴
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.orange, boxShadow: `0 0 8px ${C.orange}80` }} />
          <span style={{ fontSize: "11px", color: C.textDim, letterSpacing: "0.04em" }}>AI 보조 · 담당자 전용</span>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>

        {/* 좌측: 입력 패널 */}
        <div style={{
          width: "420px", flexShrink: 0, background: C.white,
          borderRight: `1px solid ${C.border}`,
          overflowY: "auto", padding: "28px 24px",
        }}>
          {/* 자산 유형 */}
          <div style={{ marginBottom: "24px" }}>
            <Label required>자산 유형</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {ASSET_TYPES.map(t => (
                <div key={t.id} onClick={() => handleTypeChange(t.id)} style={{
                  padding: "12px 14px", borderRadius: "8px", cursor: "pointer",
                  background: assetType === t.id ? "#FFF7F2" : C.inputBg,
                  border: `1px solid ${assetType === t.id ? C.orange : C.border}`,
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>{t.icon}</div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: assetType === t.id ? C.orange : C.text }}>{t.label}</div>
                  <div style={{ fontSize: "11px", color: C.textDim, marginTop: "2px", lineHeight: "1.4" }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 기본 정보 */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px", paddingBottom: "8px", borderBottom: `1px solid ${C.border}` }}>
              기본 정보
            </div>
            <div style={{ marginBottom: "12px" }}>
              <Label required>자산명</Label>
              <Input value={assetName} onChange={setAssetName} placeholder="자산명을 입력하세요" />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <Label>소유자 / 발행사</Label>
              <Input value={issuerName} onChange={setIssuerName} placeholder="자산 소유자 또는 발행사명" />
            </div>
            <div>
              <Label>발행 희망 규모</Label>
              <InputWithUnit value={targetSize} onChange={setTargetSize} placeholder="100" unit="억원" />
            </div>
          </div>

          {/* 유형별 세부 정보 */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px", paddingBottom: "8px", borderBottom: `1px solid ${C.border}` }}>
              {currentType?.label} 세부 정보
              <span style={{ fontSize: "10px", color: C.orange, fontWeight: "600", marginLeft: "6px" }}>1개 이상 필수</span>
            </div>
            {currentType?.fields.map(field => (
              <div key={field.key} style={{ marginBottom: "12px" }}>
                <Label>{field.label}</Label>
                {field.unit ? (
                  <InputWithUnit
                    value={fieldValues[field.key] || ""}
                    onChange={(v) => handleFieldChange(field.key, v)}
                    placeholder={field.placeholder}
                    unit={field.unit}
                  />
                ) : (
                  <Input
                    value={fieldValues[field.key] || ""}
                    onChange={(v) => handleFieldChange(field.key, v)}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 추가 정보 */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px", paddingBottom: "8px", borderBottom: `1px solid ${C.border}` }}>
              추가 정보 <span style={{ fontWeight: "400", textTransform: "none", letterSpacing: 0 }}>(선택)</span>
            </div>
            <Input
              value={freeText} onChange={setFreeText}
              placeholder="특이사항, 발행사가 전달한 내용, 담당자 메모 등"
              multiline
            />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "#FEF2F2", border: `1px solid ${C.redBorder}`, borderRadius: "6px", fontSize: "12px", color: C.red, marginBottom: "14px" }}>
              {error}
            </div>
          )}
        </div>

        {/* 하단 고정 버튼 */}
        <div style={{
          position: "sticky", bottom: 0,
          background: C.white, borderTop: `1px solid ${C.border}`,
          padding: "16px 24px",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
        }}>
          <button
            onClick={handleRun}
            disabled={loading || !canSubmit}
            style={{
              width: "100%", padding: "13px",
              background: loading ? "#FFB380" : !canSubmit ? "#E8E9EC" : C.orange,
              color: !canSubmit ? C.textDim : "#fff",
              border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700",
              cursor: loading || !canSubmit ? "default" : "pointer", transition: "all 0.2s",
            }}
          >
            {loading ? "스크리닝 중..." : "스크리닝 시작 →"}
          </button>
        </div>

        {/* 우측: 결과 패널 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

          {/* 로딩 */}
          {loading && (
            <div style={{ animation: "fadeUp 0.2s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
                <div style={{
                  width: "18px", height: "18px",
                  border: `2px solid ${C.border}`, borderTop: `2px solid ${C.orange}`,
                  borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0,
                }} />
                <span style={{ fontSize: "13px", color: C.textDim }}>자산 정보를 분석하고 있습니다...</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "18px" }}>
                    <Skeleton h={10} w="50%" mb={12} />
                    <Skeleton h={12} mb={6} />
                    <Skeleton h={12} w="75%" mb={0} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 결과 */}
          {result && !loading && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>

              {/* 결과 헤더 — 자산명 + 초기화 버튼 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: C.textDim, letterSpacing: "0.08em", marginBottom: "3px" }}>
                    {ASSET_TYPES.find(t => t.id === assetType)?.label} · 스크리닝 결과
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: C.text, letterSpacing: "-0.02em" }}>
                    {resultAssetName}
                  </div>
                </div>
                <button onClick={handleReset} style={{
                  padding: "8px 16px", background: C.white,
                  border: `1px solid ${C.border}`, borderRadius: "6px",
                  fontSize: "12px", fontWeight: "600", color: C.textMid,
                  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                }}>
                  ↺ 새 자산 입력
                </button>
              </div>

              {/* 종합 판정 */}
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: "12px", padding: "22px 24px", marginBottom: "16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    종합 판정
                  </div>
                  <VerdictBadge verdict={result.verdict} />
                </div>
                <div style={{ fontSize: "14px", color: C.text, fontWeight: "600", lineHeight: "1.6", marginBottom: "8px" }}>
                  {result.verdict}
                </div>
                <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.8" }}>
                  {result.verdictReason}
                </div>
              </div>

              {/* 항목별 체크 */}
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: "12px", padding: "22px 24px", marginBottom: "16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                  항목별 검토
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {result.checks?.map((check, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "12px",
                      padding: "12px 14px", borderRadius: "8px",
                      background: check.status === "pass" ? C.greenBg : check.status === "warn" ? C.yellowBg : C.redBg,
                      border: `1px solid ${check.status === "pass" ? C.greenBorder : check.status === "warn" ? C.yellowBorder : C.redBorder}`,
                    }}>
                      <StatusIcon status={check.status} />
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: C.text, marginBottom: "3px" }}>{check.label}</div>
                        <div style={{ fontSize: "12px", color: C.textMid, lineHeight: "1.6" }}>{check.comment}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 핵심 질문 */}
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: "12px", padding: "22px 24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: "11px", color: C.textDim, fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                  본격 검토 전 확인 사항
                </div>
                <div style={{ fontSize: "12px", color: C.textDim, marginBottom: "16px" }}>
                  법무·신탁·감정평가 진행 전 자산 소유자에게 확인해야 할 핵심 질문입니다.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {result.keyQuestions?.map((q, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{
                        width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                        background: C.orangeDim, border: `1px solid ${C.orangeBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: "700", color: C.orange,
                      }}>{i + 1}</div>
                      <div style={{ fontSize: "13px", color: C.textMid, lineHeight: "1.7", paddingTop: "2px" }}>{q}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "16px", fontSize: "11px", color: C.textDim, lineHeight: "1.6" }}>
                ※ 본 스크리닝은 AI 기반 1차 필터링 결과입니다. 최종 발행 적합성은 법무·신탁·감정평가 전문가의 검토를 통해 확정됩니다.
              </div>
            </div>
          )}

          {/* 초기 안내 */}
          {!result && !loading && !error && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", textAlign: "center",
            }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: C.orangeDim, border: `1px solid ${C.orangeBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", marginBottom: "18px",
              }}>✦</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: C.textMid, marginBottom: "8px" }}>
                자산 정보를 입력하고 스크리닝을 시작하세요
              </div>
              <div style={{ fontSize: "13px", color: C.textDim, lineHeight: "1.8", maxWidth: "360px" }}>
                자산 유형별 기준에 따라 수익 구조·리스크·투자자 이해 가능성·구조 설계 가능성·시장 수요를 분석합니다.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
