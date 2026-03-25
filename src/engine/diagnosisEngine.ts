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
    /음식|식당|외식|카페|커피|주점|베이커리|제과|디저트/.test(text);
  const isRetail =
    /도소매|소매|유통|쇼핑몰|판매|스토어|마트|오픈마켓|스마트스토어|온라인판매|온라인 판매|상품판매/.test(text);
  const isService =
    /서비스|미용|교육|컨설팅|운송|여행|숙박|헬스|병원|세차|수리|대행|디자인|마케팅/.test(text);
  const isManufacturing =
    /제조|생산|공장|가공|조립|설비|기계|부품|라인|oem/.test(text);
  const isIT =
    /it|정보통신|소프트웨어|sw|플랫폼|앱|개발|saas|시스템|ai|데이터/.test(text);
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
    (input.subIndustry && input.subIndustry !== 'none' && subIndustryNormalized !== input.mainIndustry.toLowerCase()) ||
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

const getRevenueBand = (annualRevenue: number) => {
  if (annualRevenue < 5000) return 'UNDER_50M';
  if (annualRevenue < 10000) return 'UNDER_100M';
  if (annualRevenue < 30000) return 'UNDER_300M';
  if (annualRevenue < 70000) return 'UNDER_700M';
  if (annualRevenue < 150000) return 'UNDER_1_5B';
  return 'OVER_1_5B';
};

const getBaseRanges = (annualRevenue: number, industry: IndustryProfile) => {
  const band = getRevenueBand(annualRevenue);

  let semasGeneral: Range = { min: 1000, max: 3000 };
  let semasLowCredit: Range = { min: 500, max: 2000 };
  let localGuarantee: Range = { min: 2000, max: 4000 };
  let shinbo: Range = { min: 0, max: 0 };
  let kibo: Range = { min: 0, max: 0 };
  let jungjin: Range = { min: 0, max: 0 };

  switch (band) {
    case 'UNDER_50M':
      semasGeneral = { min: 1000, max: 2500 };
      semasLowCredit = { min: 500, max: 1500 };
      localGuarantee = { min: 1500, max: 3500 };
      shinbo = { min: 1000, max: 2500 };
      kibo = { min: 1500, max: 3000 };
      jungjin = { min: 1000, max: 3000 };
      break;
    case 'UNDER_100M':
      semasGeneral = { min: 1500, max: 3500 };
      semasLowCredit = { min: 700, max: 2000 };
      localGuarantee = { min: 2500, max: 4500 };
      shinbo = { min: 2000, max: 4000 };
      kibo = { min: 2500, max: 4500 };
      jungjin = { min: 2000, max: 4000 };
      break;
    case 'UNDER_300M':
      semasGeneral = { min: 2500, max: 5000 };
      semasLowCredit = { min: 1000, max: 2500 };
      localGuarantee = { min: 3500, max: 6500 };
      shinbo = { min: 3000, max: 7000 };
      kibo = { min: 3500, max: 8000 };
      jungjin = { min: 3000, max: 6000 };
      break;
    case 'UNDER_700M':
      semasGeneral = { min: 3500, max: 7000 };
      semasLowCredit = { min: 1500, max: 3000 };
      localGuarantee = { min: 5000, max: 9000 };
      shinbo = { min: 5000, max: 10000 };
      kibo = { min: 6000, max: 12000 };
      jungjin = { min: 4000, max: 8000 };
      break;
    case 'UNDER_1_5B':
      semasGeneral = { min: 4000, max: 7000 };
      semasLowCredit = { min: 1500, max: 3000 };
      localGuarantee = { min: 7000, max: 11000 };
      shinbo = { min: 7000, max: 13000 };
      kibo = { min: 8000, max: 15000 };
      jungjin = { min: 5000, max: 10000 };
      break;
    case 'OVER_1_5B':
      semasGeneral = { min: 5000, max: 7000 };
      semasLowCredit = { min: 1500, max: 3000 };
      localGuarantee = { min: 8000, max: 12000 };
      shinbo = { min: 8000, max: 15000 };
      kibo = { min: 9000, max: 18000 };
      jungjin = { min: 6000, max: 12000 };
      break;
  }

  if (industry.isFood || industry.isRetail || industry.isService) {
    shinbo = {
      min: roundTo100(shinbo.min * 0.9),
      max: roundTo100(shinbo.max * 0.9),
    };
  }

  if (industry.isManufacturing || industry.isIT) {
    localGuarantee = {
      min: roundTo100(localGuarantee.min * 0.95),
      max: roundTo100(localGuarantee.max * 0.95),
    };
    shinbo = {
      min: roundTo100(shinbo.min * 1.05),
      max: roundTo100(shinbo.max * 1.1),
    };
    kibo = {
      min: roundTo100(kibo.min * 1.1),
      max: roundTo100(kibo.max * 1.15),
    };
    jungjin = {
      min: roundTo100(jungjin.min * 1.1),
      max: roundTo100(jungjin.max * 1.2),
    };
  }

  return { semasGeneral, semasLowCredit, localGuarantee, shinbo, kibo, jungjin };
};

const applyFactor = (range: Range, factor: number): Range => {
  const safeFactor = clamp(factor, 0, 1.2);
  const min = roundTo100(range.min * safeFactor);
  const max = roundTo100(range.max * safeFactor);
  return {
    min: Math.min(min, max),
    max,
  };
};

const subtractExistingGuarantee = (range: Range, guaranteeLoan: number): Range => {
  const min = Math.max(0, range.min - guaranteeLoan);
  const max = Math.max(0, range.max - guaranteeLoan);
  return {
    min: roundTo100(min),
    max: roundTo100(max),
  };
};

const pickBestGuaranteeOption = (
  options: { name: string; range: Range }[]
): { name: string; range: Range } => {
  const sorted = [...options].sort((a, b) => b.range.max - a.range.max);
  return sorted[0] || { name: '보증기관 상담', range: { min: 0, max: 0 } };
};

const buildInstitutionLabel = (name: string, range: Range): string => {
  if (range.max <= 0) return `${name} (기존 보증/조건 반영 시 추가 한도 제한 가능)`;
  return `${name} (${formatRange(range)})`;
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
  const isVeryLowCredit = credit > 0 && credit <= 744;
  const isStrongCredit = credit >= 890;

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
      ? 'NICE 신용점수가 839점 이하라 일반자금보다 저신용 특례 또는 보수적 보증 전략이 더 현실적입니다.'
      : isVeryEarly
      ? '개업 초기 구간이라 매출·거래내역·사업 안정성 확인에 따라 가능 범위 차이가 커질 수 있습니다.'
      : '혼합형 업종으로 보아 실제 매출 비중이 높은 업종 기준 추가 확인이 필요합니다.';
  } else {
    status = 'ELIGIBLE';
    statusMessage = '현재 입력 기준으로는 정책자금 검토 가능성이 높은 편입니다.';
    statusReason = '업력, 매출, 부채, 신용 흐름이 전반적으로 안정적이라 기관별 비교 진행이 가능한 상태입니다.';
  }

  const baseRanges = getBaseRanges(revenue, industry);

  const ageFactor = isVeryEarly ? 0.55 : isEarly ? 0.72 : isGrowth ? 0.88 : 1;
  const creditFactor = isVeryLowCredit ? 0.55 : isLowCredit ? 0.75 : credit < 890 ? 0.9 : 1;
  const debtFactor =
    debtRatio <= 0.3 ? 1 :
    debtRatio <= 0.7 ? 0.9 :
    debtRatio <= 1.0 ? 0.78 :
    debtRatio <= 1.5 ? 0.58 : 0.35;

  const semasFactor = clamp(ageFactor * Math.max(creditFactor, isLowCredit ? 0.72 : creditFactor) * debtFactor, 0.3, 1);
  const guaranteeFactor = clamp((ageFactor + 0.12) * (creditFactor + 0.05) * debtFactor, 0.25, 1.05);
  const techGuaranteeFactor = clamp((ageFactor + 0.15) * (creditFactor + 0.08) * debtFactor, 0.25, 1.1);
  const jungjinFactor = clamp((ageFactor + 0.12) * (creditFactor + 0.05) * Math.max(debtFactor, 0.45), 0.3, 1);

  const semasGeneralRange =
    !isLowCredit && status !== 'TEMP_INELIGIBLE'
      ? applyFactor(baseRanges.semasGeneral, semasFactor)
      : { min: 0, max: 0 };

  const semasLowCreditRange =
    isLowCredit && status !== 'TEMP_INELIGIBLE'
      ? applyFactor(baseRanges.semasLowCredit, clamp(ageFactor * debtFactor * 1.05, 0.35, 1))
      : { min: 0, max: 0 };

  const localGuaranteeRange =
    status !== 'TEMP_INELIGIBLE'
      ? subtractExistingGuarantee(applyFactor(baseRanges.localGuarantee, guaranteeFactor), existingGuarantee)
      : { min: 0, max: 0 };

  const shinboEligible =
    !isVeryEarly &&
    !industry.isFood &&
    !hasDelinquency &&
    !hasTaxArrears &&
    revenue >= 3000;

  const shinboRange =
    shinboEligible && status !== 'TEMP_INELIGIBLE'
      ? subtractExistingGuarantee(applyFactor(baseRanges.shinbo, industry.isManufacturing || industry.isIT ? techGuaranteeFactor : guaranteeFactor), existingGuarantee)
      : { min: 0, max: 0 };

  const kiboEligible =
    (industry.isManufacturing || industry.isIT) &&
    monthsInBusiness >= 6 &&
    revenue >= 3000 &&
    !hasDelinquency &&
    !hasTaxArrears;

  const kiboRange =
    kiboEligible && status !== 'TEMP_INELIGIBLE'
      ? subtractExistingGuarantee(applyFactor(baseRanges.kibo, techGuaranteeFactor), existingGuarantee)
      : { min: 0, max: 0 };

  const jungjinEligible =
    !hasDelinquency &&
    !hasTaxArrears &&
    monthsInBusiness >= 6 &&
    (
      ((industry.isManufacturing || industry.isIT) && employeeCount >= 1) ||
      (!(industry.isManufacturing || industry.isIT) && employeeCount >= 5 && revenue >= 30000)
    );

  const jungjinRange =
    jungjinEligible && status !== 'TEMP_INELIGIBLE'
      ? applyFactor(baseRanges.jungjin, jungjinFactor)
      : { min: 0, max: 0 };

  const semasChosenRange = semasGeneralRange.max >= semasLowCreditRange.max ? semasGeneralRange : semasLowCreditRange;
  const semasChosenName =
    semasGeneralRange.max >= semasLowCreditRange.max
      ? '소상공인시장진흥공단'
      : '소상공인시장진흥공단 저신용자금';

  const bestGuarantee = pickBestGuaranteeOption([
    { name: '지역신용보증재단', range: localGuaranteeRange },
    { name: '신용보증기금', range: shinboRange },
    { name: '기술보증기금', range: kiboRange },
  ]);

  const realisticRangeValue: Range =
    status === 'TEMP_INELIGIBLE'
      ? { min: 0, max: 0 }
      : {
          min: roundTo100(semasChosenRange.min + bestGuarantee.range.min),
          max: roundTo100(semasChosenRange.max + bestGuarantee.range.max),
        };

  const conservativeMaxValue =
    status === 'TEMP_INELIGIBLE'
      ? 0
      : roundTo100(realisticRangeValue.max + (jungjinRange.max > 0 ? Math.round(jungjinRange.max * 0.7) : 0));

  const realisticRange =
    realisticRangeValue.max > 0 ? formatRange(realisticRangeValue) : '상담 후 확인 가능';

  const conservativeMax =
    conservativeMaxValue > 0 ? `${formatMoney(conservativeMaxValue)} 내외` : '상담 후 확인 가능';

  const primaryInstitutions: string[] = [];
  const secondaryInstitutions: string[] = [];

  if (status !== 'TEMP_INELIGIBLE') {
    if (semasChosenRange.max > 0) {
      primaryInstitutions.push(buildInstitutionLabel(semasChosenName, semasChosenRange));
    }

    if (bestGuarantee.range.max > 0) {
      primaryInstitutions.push(buildInstitutionLabel(bestGuarantee.name, bestGuarantee.range));
    }

    if (jungjinRange.max > 0) {
      secondaryInstitutions.push(buildInstitutionLabel('중소벤처기업진흥공단', jungjinRange));
    }

    const remainingOptions = [
      { name: '지역신용보증재단', range: localGuaranteeRange },
      { name: '신용보증기금', range: shinboRange },
      { name: '기술보증기금', range: kiboRange },
    ]
      .filter((item) => item.name !== bestGuarantee.name && item.range.max > 0)
      .sort((a, b) => b.range.max - a.range.max);

    remainingOptions.forEach((item) => {
      secondaryInstitutions.push(buildInstitutionLabel(item.name, item.range));
    });

    if (isLowCredit && semasLowCreditRange.max > 0 && semasChosenName !== '소상공인시장진흥공단 저신용자금') {
      secondaryInstitutions.unshift(buildInstitutionLabel('소상공인시장진흥공단 저신용자금', semasLowCreditRange));
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
      executionOrder.push('소상공인시장진흥공단 일반자금 가능 여부를 먼저 확인');
    } else if (semasLowCreditRange.max > 0) {
      executionOrder.push('소상공인시장진흥공단 저신용자금을 우선 검토');
    }

    if (isLowCredit && semasGeneralRange.max > 0 && semasLowCreditRange.max > 0) {
      executionOrder.push('저신용 특례는 보조 카드로 함께 검토');
    } else if (isLowCredit && semasLowCreditRange.max > 0 && semasGeneralRange.max <= 0) {
      executionOrder.push('저신용 특례 승인 가능 범위를 기준으로 보증 연계 여부 확인');
    }

    if (bestGuarantee.range.max > 0) {
      executionOrder.push(`${bestGuarantee.name} 중심으로 보증 한도 확장 검토`);
    }

    const altGuarantees = [
      { name: '지역신용보증재단', range: localGuaranteeRange },
      { name: '신용보증기금', range: shinboRange },
      { name: '기술보증기금', range: kiboRange },
    ].filter((item) => item.name !== bestGuarantee.name && item.range.max > 0);

    if (altGuarantees.length > 0) {
      executionOrder.push('추가 보증기관은 업종 적합성과 기존 보증 사용 규모를 보고 택1로 비교');
    }

    if (jungjinRange.max > 0) {
      executionOrder.push('중소벤처기업진흥공단은 마지막에 추가 한도 관점으로 검토');
    }
  }

  let direction = '';

  if (status === 'TEMP_INELIGIBLE') {
    direction = '지금은 접수보다 연체·체납 해소 후 재진단이 우선입니다.';
  } else if (isLowCredit) {
    direction = '저신용 특례 + 1개 보증기관 조합으로 보수적으로 접근하는 전략이 적합합니다.';
  } else if (industry.isManufacturing || industry.isIT) {
    direction = '기술·제조형 기관과 보증기관을 비교해 한도를 넓히는 전략이 유리합니다.';
  } else if (industry.isFood || industry.isRetail || industry.isService) {
    direction = '소진공 + 보증재단 중심으로 현실적인 운영자금 조합을 먼저 보는 흐름이 적합합니다.';
  } else {
    direction = '소진공과 보증기관을 함께 비교하면서 가장 가능성 높은 경로부터 진행하는 전략이 좋습니다.';
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
      : `${industry.label} · ${ageLabel} · 연매출 ${formatMoney(revenue)} · 기존대출 ${formatMoney(totalDebt)} · NICE ${credit}점 반영`;

  const notes: string[] = [];

  if (status !== 'TEMP_INELIGIBLE') {
    notes.push(`현재 업종 성격은 ${industry.label}으로 판단됩니다.`);
    notes.push(`업력은 약 ${yearsInBusiness.toFixed(1)}년 수준이며, ${ageLabel} 구간으로 반영했습니다.`);
    notes.push(`기존 일반대출 ${formatMoney(generalLoan)}, 보증대출 ${formatMoney(existingGuarantee)}를 합산한 총부채는 ${formatMoney(totalDebt)}입니다.`);
    if (bestGuarantee.range.max > 0) {
      notes.push(`보증기관은 동시 합산보다 가장 적합한 1개 기관 중심으로 보는 것이 현실적입니다.`);
    }
    if (jungjinRange.max > 0) {
      notes.push(`중소벤처기업진흥공단은 업종과 직원 수 조건상 추가 검토 여지가 있습니다.`);
    }
    if (industry.isMixed) {
      notes.push('혼합형 업종은 실제 매출 비중이 높은 업종 기준으로 최종 전략이 달라질 수 있습니다.');
    }
    if (isLowCredit) {
      notes.push('저신용 구간은 일반 상품보다 특례·보수적 한도 중심으로 보는 것이 안전합니다.');
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
          semasChosenRange.max > 0 ? `${semasChosenName} 연계 검토` : '',
          bestGuarantee.range.max > 0 ? `${bestGuarantee.name} 연계 검토` : '',
          jungjinRange.max > 0 ? '중소벤처기업진흥공단 추가 검토' : '',
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
