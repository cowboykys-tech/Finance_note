import { UserInput, DiagnosisResult } from '../types';

type Status = 'ELIGIBLE' | 'CONDITIONAL' | 'REVIEW_REQUIRED' | 'TEMP_INELIGIBLE';

type Range = {
  min: number;
  max: number;
};

type IndustryProfile = {
  isFood: boolean;
  isRetail: boolean;
  isService: boolean;
  isManufacturing: boolean;
  isIT: boolean;
  isConstruction: boolean;
  isOnline: boolean;
  isMixed: boolean;
  label: string;
};

type ChunkType = 'CHUNK1' | 'CHUNK2';
type BandId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P';
type LCode = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';

type LimitRow = Partial<Record<LCode, Range>>;

const roundTo100 = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value / 100) * 100;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const safeNumber = (value: number): number => {
  return Number.isFinite(value) ? value : 0;
};

const formatMoney = (amount: number): string => {
  const safe = Math.max(0, Math.round(amount));
  const eok = Math.floor(safe / 10000);
  const man = safe % 10000;

  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
  if (eok > 0) return `${eok}억원`;
  return `${safe.toLocaleString()}만원`;
};

const formatRange = (range: Range): string => {
  if (range.max <= 0) return '상담 후 확인 가능';
  return `${formatMoney(range.min)} \~ ${formatMoney(range.max)}`;
};

const monthsBetween = (startDate: string): number => {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return 0;

  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (now.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
};

const getIndustryProfile = (input: UserInput): IndustryProfile => {
  const text = `${input.mainIndustry} ${input.subIndustry} ${input.businessDescription}`.toLowerCase();

  const isFood =
    /음식|식당|외식|카페|커피|주점|베이커리|제과|디저트|배달전문점/.test(text);
  const isRetail =
    /도소매|소매|유통|쇼핑몰|판매|스토어|마트|오픈마켓|스마트스토어|온라인판매|온라인 판매|상품판매|브랜드|이커머스/.test(text);
  const isService =
    /서비스|미용|교육|컨설팅|운송|여행|숙박|헬스|병원|세차|수리|대행|광고|마케팅/.test(text);
  const isManufacturing =
    /제조|생산|공장|가공|조립|설비|기계|부품|라인|oem|사출|반도체|배터리|의료기기/.test(text);
  const isIT =
    /it|정보통신|소프트웨어|sw|앱개발|앱 개발|개발|saas|시스템|ai|데이터|플랫폼 개발|서비스 개발/.test(text);
  const isConstruction =
    /건설|인테리어|시공|토목|전기공사|설비공사/.test(text);
  const isOnline =
    /온라인|쇼핑몰|스마트스토어|오픈마켓|쿠팡|자사몰|플랫폼/.test(text);

  const categoryCount = [
    isFood,
    isRetail,
    isService,
    isManufacturing,
    isIT,
    isConstruction,
  ].filter(Boolean).length;

  const subIndustryNormalized = (input.subIndustry || '').toLowerCase();
  const isMixed =
    (input.subIndustry && input.subIndustry !== 'none' && subIndustryNormalized !== (input.mainIndustry || '').toLowerCase()) ||
    categoryCount >= 2;

  let label = '일반 소상공인';
  if (isManufacturing && isIT) label = '제조·기술형';
  else if (isManufacturing) label = '제조형';
  else if (isIT) label = '기술형';
  else if (isFood) label = '외식업';
  else if (isRetail) label = '도소매·유통형';
  else if (isConstruction) label = '건설형';
  else if (isService) label = '서비스형';

  return {
    isFood,
    isRetail,
    isService,
    isManufacturing,
    isIT,
    isConstruction,
    isOnline,
    isMixed,
    label,
  };
};

const LIMIT_TABLE: Record<ChunkType, Record<BandId, LimitRow>> = {
  CHUNK1: {
    A: {
      L1: { min: 1000, max: 3000 },
      L4: { min: 0, max: 0 },
      L5: { min: 1000, max: 2500 },
    },
    B: {
      L1: { min: 2000, max: 4000 },
      L4: { min: 1000, max: 1000 },
      L5: { min: 1000, max: 2500 },
    },
    C: {
      L1: { min: 3000, max: 5000 },
      L4: { min: 2000, max: 4000 },
      L5: { min: 1500, max: 3000 },
    },
    D: {
      L1: { min: 3000, max: 7000 },
      L4: { min: 2000, max: 5000 },
      L5: { min: 2000, max: 3000 },
    },
    E: {
      L1: { min: 4000, max: 8000 },
      L4: { min: 3000, max: 7000 },
      L5: { min: 2000, max: 3000 },
      L6: { min: 10000, max: 10000 },
    },
    F: {
      L1: { min: 7000, max: 10000 },
      L2: { min: 10000, max: 15000 },
      L4: { min: 4000, max: 9000 },
      L5: { min: 2000, max: 3000 },
      L6: { min: 10000, max: 10000 },
    },
    G: {
      L1: { min: 10000, max: 10000 },
      L2: { min: 15000, max: 25000 },
      L4: { min: 5000, max: 9000 },
      L5: { min: 2000, max: 3000 },
      L6: { min: 10000, max: 10000 },
    },
    H: {
      L1: { min: 10000, max: 10000 },
      L2: { min: 15000, max: 33000 },
      L4: { min: 9000, max: 9000 },
      L5: { min: 2000, max: 3000 },
      L6: { min: 20000, max: 20000 },
    },
    I: {},
    J: {},
    K: {},
    L: {},
    M: {},
    N: {},
    O: {},
    P: {},
  },
  CHUNK2: {
    A: {},
    B: {},
    C: {},
    D: {},
    E: {},
    F: {},
    G: {},
    H: {},
    I: {
      L1: { min: 1000, max: 3000 },
      L4: { min: 0, max: 0 },
      L5: { min: 1000, max: 2500 },
    },
    J: {
      L1: { min: 2000, max: 4000 },
      L4: { min: 1000, max: 3000 },
      L5: { min: 1000, max: 2500 },
    },
    K: {
      L1: { min: 3000, max: 5000 },
      L3: { min: 5000, max: 5000 },
      L4: { min: 2000, max: 4000 },
      L5: { min: 1500, max: 3000 },
      L6: { min: 10000, max: 10000 },
    },
    L: {
      L1: { min: 3000, max: 7000 },
      L3: { min: 10000, max: 10000 },
      L4: { min: 2000, max: 5000 },
      L5: { min: 2000, max: 3000 },
      L6: { min: 10000, max: 10000 },
    },
    M: {
      L1: { min: 4000, max: 8000 },
      L3: { min: 10000, max: 20000 },
      L4: { min: 3000, max: 7000 },
      L5: { min: 2000, max: 3000 },
      L6: { min: 10000, max: 20000 },
    },
    N: {
      L1: { min: 7000, max: 10000 },
      L3: { min: 20000, max: 30000 },
      L4: { min: 4000, max: 9000 },
      L5: { min: 2000, max: 3000 },
      L6: { min: 10000, max: 30000 },
    },
    O: {
      L1: { min: 10000, max: 10000 },
      L3: { min: 30000, max: 40000 },
      L4: { min: 5000, max: 9000 },
      L5: { min: 2000, max: 3000 },
      L6: { min: 10000, max: 30000 },
    },
    P: {
      L1: { min: 10000, max: 10000 },
      L3: { min: 30000, max: 50000 },
      L4: { min: 9000, max: 9000 },
      L5: { min: 2000, max: 3000 },
      L6: { min: 10000, max: 40000 },
    },
  },
};

const buildInstitutionLabel = (name: string, range: Range, extra?: string): string => {
  if (range.max <= 0) return extra ? `${name} (${extra})` : `${name} (추가 한도 제한 가능)`;
  return extra ? `${name} (${formatRange(range)}, ${extra})` : `${name} (${formatRange(range)})`;
};

const subtractExistingGuarantee = (range: Range, guaranteeLoan: number): Range => {
  const min = Math.max(0, range.min - guaranteeLoan);
  const max = Math.max(0, range.max - guaranteeLoan);
  return {
    min: roundTo100(min),
    max: roundTo100(max),
  };
};

const getCombinedText = (input: UserInput): string => {
  return `${input.mainIndustry || ''} ${input.subIndustry || ''} ${input.businessDescription || ''}`.toLowerCase();
};

const classifyChunk = (input: UserInput, industry: IndustryProfile): ChunkType => {
  const text = getCombinedText(input);

  const hasManufacturingKeyword =
    /제조|공장|생산|생산라인|공정|가공|조립|설비|부품|사출|oem/.test(text);

  const hasITDevKeyword =
    /소프트웨어|sw|정보통신|개발|saas|시스템|ai|데이터|플랫폼 개발|서비스 개발/.test(text);

  const hasChunk1Keyword =
    /도소매|소매|유통|서비스|숙박|음식점|외식|카페|식당|프랜차이즈|쇼핑몰|온라인판매|브랜드|배달전문점/.test(text);

  const hasODMOnly =
    /odm|중국/.test(text) && !/oem|공장|제조|생산라인/.test(text);

  if (hasManufacturingKeyword) return 'CHUNK2';
  if (hasITDevKeyword && !hasChunk1Keyword) return 'CHUNK2';
  if (hasODMOnly) return 'CHUNK1';
  if (industry.isFood || industry.isRetail || industry.isService) return 'CHUNK1';
  if (industry.isManufacturing || industry.isIT) return 'CHUNK2';

  return 'CHUNK1';
};

const getBandId = (annualRevenue: number, chunk: ChunkType): BandId => {
  const revenue = safeNumber(annualRevenue);

  if (chunk === 'CHUNK1') {
    if (revenue <= 2999) return 'A';
    if (revenue <= 6999) return 'B';
    if (revenue <= 21999) return 'C';
    if (revenue <= 29999) return 'D';
    if (revenue <= 69999) return 'E';
    if (revenue <= 99999) return 'F';
    if (revenue <= 129999) return 'G';
    return 'H';
  }

  if (revenue <= 2999) return 'I';
  if (revenue <= 6999) return 'J';
  if (revenue <= 21999) return 'K';
  if (revenue <= 29999) return 'L';
  if (revenue <= 69999) return 'M';
  if (revenue <= 99999) return 'N';
  if (revenue <= 129999) return 'O';
  return 'P';
};

const getBandDescription = (bandId: BandId): string => {
  const map: Record<BandId, string> = {
    A: '0원 \~ 2,999만원 이하',
    B: '3,000만원 \~ 6,999만원 이하',
    C: '7,000만원 \~ 2억 1,999만원 이하',
    D: '2억 2,000만원 \~ 2억 9,999만원 이하',
    E: '3억원 \~ 6억 9,999만원 이하',
    F: '7억원 \~ 9억 9,999만원 이하',
    G: '10억원 \~ 12억 9,999만원 이하',
    H: '13억원 이상',
    I: '0원 \~ 2,999만원 이하',
    J: '3,000만원 \~ 6,999만원 이하',
    K: '7,000만원 \~ 2억 1,999만원 이하',
    L: '2억 2,000만원 \~ 2억 9,999만원 이하',
    M: '3억원 \~ 6억 9,999만원 이하',
    N: '7억원 \~ 9억 9,999만원 이하',
    O: '10억원 \~ 12억 9,999만원 이하',
    P: '13억원 이상',
  };

  return map[bandId];
};

const getRow = (chunk: ChunkType, bandId: BandId): LimitRow => {
  return LIMIT_TABLE[chunk][bandId] || {};
};

const getRange = (row: LimitRow, code: LCode): Range => {
  return row[code] || { min: 0, max: 0 };
};

const pickBestGuaranteeOption = (
  chunk: ChunkType,
  row: LimitRow,
  existingGuarantee: number
): { name: string; code: 'L1' | 'L2' | 'L3'; range: Range } => {
  const candidates =
    chunk === 'CHUNK1'
      ? [
          { name: '지역신용보증재단', code: 'L1' as const, range: subtractExistingGuarantee(getRange(row, 'L1'), existingGuarantee) },
          { name: '신용보증기금', code: 'L2' as const, range: subtractExistingGuarantee(getRange(row, 'L2'), existingGuarantee) },
        ]
      : [
          { name: '지역신용보증재단', code: 'L1' as const, range: subtractExistingGuarantee(getRange(row, 'L1'), existingGuarantee) },
          { name: '기술보증기금', code: 'L3' as const, range: subtractExistingGuarantee(getRange(row, 'L3'), existingGuarantee) },
        ];

  const sorted = [...candidates].sort((a, b) => {
    if (b.range.max !== a.range.max) return b.range.max - a.range.max;
    return b.range.min - a.range.min;
  });

  return sorted[0] || { name: '보증기관 상담', code: 'L1', range: { min: 0, max: 0 } };
};

export const runEngine = (input: UserInput): DiagnosisResult => {
  const {
    customerName,
    customerPhone,
    customerRegion,
    customerConcern,
    mainIndustry,
    subIndustry,
    businessDescription,
    annualRevenue,
    loan,
    guaranteeLoan,
    credit,
    startDate,
    employeeCount,
    fundPurpose,
    hasDelinquency,
    hasTaxArrears,
  } = input;

  const revenue = safeNumber(annualRevenue);
  const generalLoan = safeNumber(loan);
  const existingGuarantee = safeNumber(guaranteeLoan);
  const totalDebt = generalLoan + existingGuarantee;
  const debtRatio = revenue > 0 ? totalDebt / revenue : totalDebt > 0 ? 999 : 0;
  const monthsInBusiness = monthsBetween(startDate);
  const yearsInBusiness = monthsInBusiness / 12;
  const industry = getIndustryProfile(input);

  const isVeryEarly = monthsInBusiness < 6;
  const isEarly = monthsInBusiness >= 6 && monthsInBusiness < 12;
  const isGrowth = monthsInBusiness >= 12 && monthsInBusiness < 36;
  const isLowCredit = credit > 0 && credit <= 839;

  let status: Status = 'ELIGIBLE';
  let statusMessage = '';
  let statusReason = '';

  if (hasDelinquency || hasTaxArrears) {
    status = 'TEMP_INELIGIBLE';
    statusMessage = '현재는 정책자금 진행보다 선결 과제 해소가 우선입니다.';
    statusReason = hasDelinquency
      ? '현재 연체 정보가 있어 대부분의 정책자금 및 보증 심사 진행이 제한될 가능성이 높습니다.'
      : '국세 또는 지방세 체납 정보가 있어 접수 전 완납 정리가 우선 필요합니다.';
  } else if (credit <= 0 || !startDate) {
    status = 'REVIEW_REQUIRED';
    statusMessage = '기본 입력 정보 보완 후 다시 판단하는 것이 정확합니다.';
    statusReason = '신용점수 또는 개업일 정보가 불완전하면 실제 가능 기관과 예상 범위가 크게 달라질 수 있습니다.';
  } else if (revenue <= 0) {
    status = 'REVIEW_REQUIRED';
    statusMessage = '매출 확인이 필요한 초기 검토 단계입니다.';
    statusReason = '매출 정보가 없거나 0으로 입력되어 일반적인 한도 추정 대신 실제 증빙 기준 재판단이 필요합니다.';
  } else if (debtRatio >= 1.5 || existingGuarantee >= revenue * 0.8) {
    status = 'REVIEW_REQUIRED';
    statusMessage = '기존 부채와 보증 사용 규모를 반영한 정밀 검토가 필요합니다.';
    statusReason = '연매출 대비 부채 또는 기존 보증 사용 비중이 높아 추가 한도는 보수적으로 봐야 합니다.';
  } else if (isLowCredit || isVeryEarly || industry.isMixed) {
    status = 'CONDITIONAL';
    statusMessage = '조건부로 검토 가능한 구간입니다.';
    statusReason = isLowCredit
      ? 'NICE 신용점수가 839점 이하라 일반자금 외에 저신용 자금을 함께 검토해야 합니다.'
      : isVeryEarly
      ? '개업 초기 구간이라 서류와 거래 흐름에 따라 실제 가능 범위 차이가 커질 수 있습니다.'
      : '혼합형 업종으로 보여 실제 매출 비중이 높은 업종 기준 추가 확인이 필요합니다.';
  } else {
    status = 'ELIGIBLE';
    statusMessage = '현재 입력 기준으로는 정책자금 검토 가능성이 높은 편입니다.';
    statusReason = '업력, 매출, 부채, 신용 흐름이 전반적으로 안정적이라 기관별 비교 진행이 가능한 상태입니다.';
  }

  const chunk = classifyChunk(input, industry);
  const bandId = getBandId(revenue, chunk);
  const row = getRow(chunk, bandId);
  const bandDescription = getBandDescription(bandId);

  const l4Range = status !== 'TEMP_INELIGIBLE' ? getRange(row, 'L4') : { min: 0, max: 0 };
  const l5Range =
    status !== 'TEMP_INELIGIBLE' && isLowCredit
      ? getRange(row, 'L5')
      : { min: 0, max: 0 };

  const bestGuarantee = status !== 'TEMP_INELIGIBLE'
    ? pickBestGuaranteeOption(chunk, row, existingGuarantee)
    : { name: '보증기관 상담', code: 'L1' as const, range: { min: 0, max: 0 } };

  const localGuaranteeRange =
    status !== 'TEMP_INELIGIBLE'
      ? subtractExistingGuarantee(getRange(row, 'L1'), existingGuarantee)
      : { min: 0, max: 0 };

  const shinboRange =
    status !== 'TEMP_INELIGIBLE'
      ? subtractExistingGuarantee(getRange(row, 'L2'), existingGuarantee)
      : { min: 0, max: 0 };

  const kiboRange =
    status !== 'TEMP_INELIGIBLE'
      ? subtractExistingGuarantee(getRange(row, 'L3'), existingGuarantee)
      : { min: 0, max: 0 };

  const semasGeneralRange = l4Range;
  const semasLowCreditRange = l5Range;

  const jungjinBaseRange = status !== 'TEMP_INELIGIBLE' ? getRange(row, 'L6') : { min: 0, max: 0 };

  const isManufacturingLike = chunk === 'CHUNK2';
  const jungjinEligible =
    jungjinBaseRange.max > 0 &&
    !hasDelinquency &&
    !hasTaxArrears &&
    monthsInBusiness >= 6 &&
    (
      (isManufacturingLike && employeeCount >= 1) ||
      (!isManufacturingLike && employeeCount >= 5)
    );

  const jungjinRange = jungjinEligible ? jungjinBaseRange : { min: 0, max: 0 };

  const totalExcludingJungjin: Range =
    status === 'TEMP_INELIGIBLE'
      ? { min: 0, max: 0 }
      : {
          min: roundTo100(bestGuarantee.range.min + l4Range.min + l5Range.min),
          max: roundTo100(bestGuarantee.range.max + l4Range.max + l5Range.max),
        };

  const totalIncludingJungjin: Range =
    status === 'TEMP_INELIGIBLE'
      ? { min: 0, max: 0 }
      : {
          min: roundTo100(bestGuarantee.range.min + l4Range.min + l5Range.min + jungjinRange.min),
          max: roundTo100(bestGuarantee.range.max + l4Range.max + l5Range.max + jungjinRange.max),
        };

  const realisticRange =
    totalExcludingJungjin.max > 0 ? formatRange(totalExcludingJungjin) : '상담 후 확인 가능';

  const conservativeMaxValue =
    totalIncludingJungjin.max > 0 ? totalIncludingJungjin.max : totalExcludingJungjin.max;

  const conservativeMax =
    conservativeMaxValue > 0 ? `${formatMoney(conservativeMaxValue)} 내외` : '상담 후 확인 가능';

  const primaryInstitutions: string[] = [];
  const secondaryInstitutions: string[] = [];

  if (status !== 'TEMP_INELIGIBLE') {
    if (semasGeneralRange.max > 0) {
      primaryInstitutions.push(buildInstitutionLabel('소상공인시장진흥공단', semasGeneralRange));
    }

    if (bestGuarantee.range.max > 0) {
      primaryInstitutions.push(buildInstitutionLabel(bestGuarantee.name, bestGuarantee.range));
    }

    if (semasLowCreditRange.max > 0) {
      secondaryInstitutions.push(buildInstitutionLabel('소상공인시장진흥공단 저신용자금', semasLowCreditRange));
    }

    if (bestGuarantee.name !== '지역신용보증재단') {
      secondaryInstitutions.push(
        localGuaranteeRange.max > 0
          ? buildInstitutionLabel('지역신용보증재단', localGuaranteeRange, '보증 공유한도상 택1')
          : '지역신용보증재단 (보증 공유한도 또는 기존 보증 반영 시 추가 한도 제한 가능)'
      );
    }

    if (bestGuarantee.name !== '신용보증기금') {
      secondaryInstitutions.push(
        shinboRange.max > 0
          ? buildInstitutionLabel('신용보증기금', shinboRange, chunk === 'CHUNK1' ? '보증 공유한도상 택1' : '해당 CHUNK 비허용')
          : chunk === 'CHUNK1'
          ? '신용보증기금 (보증 공유한도 또는 해당 구간 미표기 시 추가 한도 제한 가능)'
          : '신용보증기금 (해당 업종군 비허용)'
      );
    }

    if (bestGuarantee.name !== '기술보증기금') {
      secondaryInstitutions.push(
        kiboRange.max > 0
          ? buildInstitutionLabel('기술보증기금', kiboRange, chunk === 'CHUNK2' ? '보증 공유한도상 택1' : '해당 CHUNK 비허용')
          : chunk === 'CHUNK2'
          ? '기술보증기금 (보증 공유한도 또는 해당 구간 미표기 시 추가 한도 제한 가능)'
          : '기술보증기금 (해당 업종군 비허용)'
      );
    }

    if (jungjinBaseRange.max > 0) {
      secondaryInstitutions.push(
        jungjinEligible
          ? buildInstitutionLabel('중소벤처기업진흥공단', jungjinRange)
          : '중소벤처기업진흥공단 (현재 입력 기준 직원수/업력 요건 재확인 필요)'
      );
    }
  }

  const executionOrder: string[] = [];

  if (status === 'TEMP_INELIGIBLE') {
    executionOrder.push(
      hasDelinquency ? '연체 해소 및 정상 거래 이력 복구' : '체납 세금 정리 및 완납증명 확보',
      '완납/정상화 이후 정책자금 재진단',
      '그 다음 기관별 순서 재설계'
    );
  } else {
    if (semasGeneralRange.max > 0) {
      executionOrder.push(`소상공인시장진흥공단 일반자금부터 확인 (${formatRange(semasGeneralRange)})`);
    }

    if (semasLowCreditRange.max > 0) {
      executionOrder.push(`저신용 특례는 추가 카드로 검토 (${formatRange(semasLowCreditRange)})`);
    }

    if (bestGuarantee.range.max > 0) {
      executionOrder.push(`${bestGuarantee.name} 중심으로 보증 연계 검토 (${formatRange(bestGuarantee.range)})`);
    }

    if (jungjinBaseRange.max > 0) {
      executionOrder.push(
        jungjinEligible
          ? `중소벤처기업진흥공단은 마지막에 추가 한도 검토 (${formatRange(jungjinRange)})`
          : '중소벤처기업진흥공단은 직원수/업력 요건 확인 후 마지막에 검토'
      );
    }
  }

  let direction = '';

  if (status === 'TEMP_INELIGIBLE') {
    direction = '지금은 접수보다 연체·체납 해소 후 재진단이 우선입니다.';
  } else if (isLowCredit) {
    direction = '일반자금 + 저신용 추가 한도 + 보증 1개 기관 조합으로 보수적으로 접근하는 전략이 적합합니다.';
  } else if (chunk === 'CHUNK2') {
    direction = '제조·기술형 기준으로 보증 1개 기관과 직접대출을 조합해 한도를 넓히는 전략이 유리합니다.';
  } else {
    direction = '소진공 일반 + 보증 1개 기관 중심으로 현실적인 운영자금 조합을 먼저 보는 흐름이 적합합니다.';
  }

  const ageLabel = isVeryEarly
    ? '개업 6개월 미만'
    : isEarly
    ? '개업 6\~12개월'
    : isGrowth
    ? '업력 1\~3년'
    : '업력 3년 이상';

  const calculationBasis =
    status === 'TEMP_INELIGIBLE'
      ? '연체/체납 선해결 필요'
      : `${industry.label} · ${ageLabel} · ${chunk} ${bandId}구간(${bandDescription}) · 연매출 ${formatMoney(revenue)} · 기존대출 ${formatMoney(totalDebt)} · NICE ${credit}점 반영`;

  const notes: string[] = [];

  if (status !== 'TEMP_INELIGIBLE') {
    notes.push(`현재 업종 성격은 ${industry.label}으로 판단됩니다.`);
    notes.push(`한도 계산은 ${chunk} ${bandId}구간(${bandDescription}) 원본 기준으로 반영했습니다.`);
    notes.push(`업력은 약 ${yearsInBusiness.toFixed(1)}년 수준이며, ${ageLabel} 구간으로 반영했습니다.`);
    notes.push(`기존 일반대출 ${formatMoney(generalLoan)}, 보증대출 ${formatMoney(existingGuarantee)}를 합산한 총부채는 ${formatMoney(totalDebt)}입니다.`);
    notes.push(`보증기관은 공유한도 구조라 동시 합산 대신 가장 유리한 1개 기관 기준으로 반영했습니다.`);
    notes.push(`중진공 제외 예상 범위는 ${formatRange(totalExcludingJungjin)}입니다.`);
    notes.push(
      jungjinEligible
        ? `중진공 포함 시 최대 범위는 ${formatRange(totalIncludingJungjin)}까지 검토 가능합니다.`
        : '중진공은 현재 입력 기준으로 직원수/업력 요건 재확인이 필요하거나 반영 제외했습니다.'
    );
    if (industry.isMixed) {
      notes.push('혼합형 업종은 실제 매출 비중이 높은 업종 기준으로 최종 전략이 달라질 수 있습니다.');
    }
    if (isLowCredit) {
      notes.push('저신용 구간은 L5 추가 한도를 함께 검토합니다.');
    } else {
      notes.push('NICE 840점 이상이면 저신용 추가 한도(L5)는 반영하지 않았습니다.');
    }
  } else {
    notes.push('현재 상태에서는 신규 접수보다 문제 해소 확인이 우선입니다.');
    notes.push('연체 또는 체납 정리 후 재진단 시 결과가 크게 달라질 수 있습니다.');
  }

  const requiredDocuments: string[] = [
    '사업자등록증 또는 사업자등록증명',
    '국세 완납증명서',
    '지방세 완납증명서',
    '부가가치세 과세표준증명 또는 수입금액증명',
    '사업장 임대차계약서',
    '사업용 통장 거래내역',
  ];

  if (employeeCount > 0) {
    requiredDocuments.push('4대보험 가입자 명부');
  }

  if (industry.isManufacturing || industry.isIT) {
    requiredDocuments.push('회사소개서 또는 사업계획서');
  }

  if (fundPurpose === '시설자금') {
    requiredDocuments.push('견적서 또는 설비 관련 증빙');
  }

  const precautions: string[] = [
    '본 결과는 입력 정보 기준의 사전 진단이며 실제 심사 결과와 다를 수 있습니다.',
    '보증기관은 공유한도 구조라 여러 기관을 동시에 합산하지 않습니다.',
    '기존 보증대출 규모가 크면 보증기관 추가 한도는 크게 줄어들 수 있습니다.',
    '정책자금은 공고 시기와 예산 상황에 따라 실제 접수 가능 여부가 달라질 수 있습니다.',
    '혼합 업종, 초기 창업, 저신용 구간은 서류 보완과 설명 방식에 따라 체감 결과 차이가 큽니다.',
  ];

  const statusLabels: Record<Status, string> = {
    ELIGIBLE: '진행 가능',
    CONDITIONAL: '조건부 검토',
    REVIEW_REQUIRED: '추가 검토 필요',
    TEMP_INELIGIBLE: '현재 진행 어려움',
  };

  const consultationSummary = [
    '[금융노트 무료상담 요청]',
    `- 이름: ${customerName}`,
    `- 연락처: ${customerPhone}`,
    `- 지역: ${customerRegion}`,
    `- 업종: ${mainIndustry || '-'}`,
    `- 세부업종: ${subIndustry && subIndustry !== 'none' ? subIndustry : '-'}`,
    `- 사업내용: ${businessDescription || '-'}`,
    `- 연매출: ${formatMoney(revenue)}`,
    `- 일반 대출: ${formatMoney(generalLoan)}`,
    `- 보증 대출: ${formatMoney(existingGuarantee)}`,
    `- NICE 신용점수: ${credit}점`,
    `- 개업일: ${startDate || '-'}`,
    `- 직원수: ${employeeCount}명`,
    `- 자금 목적: ${fundPurpose || '-'}`,
    `- 고민 사항: ${customerConcern || '없음'}`,
    '',
    '[진단 결과 요약]',
    `- 진단 상태: ${statusLabels[status]}`,
    `- 상태 메시지: ${statusMessage}`,
    `- 판단 사유: ${statusReason}`,
    `- 현실적 가능 범위: ${realisticRange}`,
    `- 보수적 최대: ${conservativeMax}`,
    `- 중진공 포함 시: ${totalIncludingJungjin.max > 0 ? formatRange(totalIncludingJungjin) : '반영 제외 또는 확인 필요'}`,
    `- 중진공 제외 시: ${totalExcludingJungjin.max > 0 ? formatRange(totalExcludingJungjin) : '상담 후 확인 가능'}`,
    `- 우선 검토 기관: ${primaryInstitutions.length > 0 ? primaryInstitutions.join(', ') : '상담 후 확인 필요'}`,
    `- 추가 검토 기관: ${secondaryInstitutions.length > 0 ? secondaryInstitutions.join(', ') : '없음'}`,
    `- 추천 방향: ${direction}`,
    `- 산출 기준: ${calculationBasis}`,
  ].join('\n');

  const summary = `${statusMessage} ${statusReason}`.trim();

  const possibleFunds =
    status === 'TEMP_INELIGIBLE'
      ? ['연체·체납 해소 후 재진단']
      : [
          `${fundPurpose || '운영'} 중심 정책자금`,
          semasGeneralRange.max > 0 ? '소상공인시장진흥공단 일반자금' : '',
          semasLowCreditRange.max > 0 ? '소상공인시장진흥공단 저신용자금' : '',
          bestGuarantee.range.max > 0 ? `${bestGuarantee.name} 연계 검토` : '',
          jungjinBaseRange.max > 0 ? '중소벤처기업진흥공단 추가 검토' : '',
        ].filter(Boolean);

  const expectedInstitutions = [...primaryInstitutions];

  const result: DiagnosisResult = {
    status,
    statusMessage,
    statusReason,
    primaryInstitutions,
    secondaryInstitutions,
    direction,
    executionOrder,
    realisticRange,
    conservativeMax,
    calculationBasis,
    notes,
    consultationSummary,
    crmData: {
      ...input,
      monthsInBusiness,
      debtRatio,
      totalDebt,
      industryLabel: industry.label,
      diagnosisStatus: status,
      timestamp: new Date().toISOString(),
    },

    summary,
    possibleFunds,
    expectedInstitutions,
    requiredDocuments,
    precautions,

    possibleInstitutions: [...primaryInstitutions, ...secondaryInstitutions],
    expectedRange: realisticRange,
    theoreticalMax: conservativeMax,
  };

  return result;
};
