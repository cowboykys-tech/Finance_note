import { UserInput, DiagnosisResult } from '../types';

/**
 * 정책자금 정밀 진단 엔진
 * 
 * [판단 규칙]
 * 1. 신용: NICE 839 이하 'lowCreditSpecial'
 * 2. 부채: 일반대출/보증대출 분리, 총부채(totalDebt) 계산
 * 3. 업종: mainIndustry/subIndustry/businessDescription 조합 (CHUNK 분류)
 * 4. 업력: startDate 기준 개월수 (VERY_EARLY, EARLY 등)
 * 5. 연체/체납: hasDelinquency, hasTaxArrears 즉시 반영
 */

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
    hasTaxArrears
  } = input;

  // 1. 프로필 생성 및 기초 데이터 계산
  const totalDebt = loan + guaranteeLoan;
  const lowCreditSpecial = credit <= 839;
  
  const start = new Date(startDate);
  const now = new Date();
  const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  
  let businessAgeCategory: 'VERY_EARLY' | 'EARLY' | 'STABLE' = 'STABLE';
  if (diffMonths < 12) businessAgeCategory = 'VERY_EARLY';
  else if (diffMonths < 36) businessAgeCategory = 'EARLY';

  // 업종 CHUNK 분류 (단순화하지 않음)
  const isMixedIndustry = subIndustry && subIndustry !== '' && subIndustry !== 'none';
  const industryChunk = isMixedIndustry ? 'CHUNK_MIXED' : `CHUNK_${mainIndustry.toUpperCase()}`;

  // 2. 상태 판단 (ELIGIBLE, CONDITIONAL, REVIEW_REQUIRED, TEMP_INELIGIBLE)
  let status: 'ELIGIBLE' | 'CONDITIONAL' | 'REVIEW_REQUIRED' | 'TEMP_INELIGIBLE' = 'ELIGIBLE';
  let statusMessage = '';
  let statusReason = '';

  if (hasDelinquency || hasTaxArrears) {
    status = 'TEMP_INELIGIBLE';
    statusMessage = '현재 정책자금 신청이 제한되는 조건이 확인되었습니다.';
    statusReason = hasDelinquency ? '현재 연체 정보가 등록되어 있습니다.' : '현재 국세 또는 지방세 체납 정보가 있습니다.';
  } else if (lowCreditSpecial) {
    status = 'CONDITIONAL';
    statusMessage = '저신용 특례 자금을 중심으로 검토가 가능합니다.';
    statusReason = 'NICE 신용점수가 839점 이하로, 일반 상품보다는 저신용자 전용 정책자금이 유리합니다.';
  } else if (totalDebt > annualRevenue * 1.5) {
    status = 'REVIEW_REQUIRED';
    statusMessage = '부채 비율이 높아 정밀한 검토가 필요합니다.';
    statusReason = '연매출 대비 총 부채 비중이 높아 보증기관의 추가 보증 한도 확인이 필요합니다.';
  } else if (isMixedIndustry) {
    status = 'REVIEW_REQUIRED';
    statusMessage = '혼합 업종으로 분류되어 상세 확인이 필요합니다.';
    statusReason = '주업종과 부업종의 성격이 달라 실제 사업 영위 형태에 따른 기관 선정이 필요합니다.';
  } else {
    status = 'ELIGIBLE';
    statusMessage = '정책자금 활용 가능성이 매우 높은 상태입니다.';
    statusReason = '신용, 매출, 부채 비율이 안정적이며 현재 조건에서 다양한 기관의 자금 신청이 가능합니다.';
  }

  // 3. 기관 후보 추출 및 실행 순서
  const primaryInstitutions: string[] = [];
  const secondaryInstitutions: string[] = [];
  const executionOrder: string[] = [];

  if (status !== 'TEMP_INELIGIBLE') {
    if (lowCreditSpecial) {
      primaryInstitutions.push('소상공인시장진흥공단 (저신용 특례)');
      secondaryInstitutions.push('서민금융진흥원');
      executionOrder.push('1. 소진공 직접대출(희망대출 등) 확인', '2. 서민금융진흥원 햇살론 등 검토');
    } else {
      if (businessAgeCategory === 'VERY_EARLY' || businessAgeCategory === 'EARLY') {
        primaryInstitutions.push('중소벤처기업진흥공단 (창업자금)', '지역신용보증재단 (신규창업보증)');
        secondaryInstitutions.push('신용보증기금 (스타트업 보증)');
        executionOrder.push('1. 중진공 청년전용창업자금(해당 시) 또는 창업기반지원자금', '2. 지역보증재단 스타트업 보증');
      } else {
        primaryInstitutions.push('소상공인시장진흥공단 (경영안정자금)', '지역신용보증재단');
        secondaryInstitutions.push('신용보증기금');
        executionOrder.push('1. 소진공 정책자금(대리대출/직접대출) 확인', '2. 지역보증재단 보증서 발급');
      }
    }
  }

  // 4. 가능 금액 범위 계산 (조합 기준)
  let minAmount = 0;
  let maxAmount = 0;
  let conservativeMaxAmount = 0;
  let calculationBasis = '';

  if (status !== 'TEMP_INELIGIBLE') {
    // 4-1. 소진공 그룹 (직접/대리대출)
    let sojinMin = 0;
    let sojinMax = 0;
    
    // E구간 내부 보정 (매출 규모에 따른 미세 조정)
    // 기준: 3억 ~ 7억 사이에서 보정
    let revenueCorrection = 1.0;
    if (annualRevenue >= 30000 && annualRevenue < 70000) {
      // 3억(1.0) ~ 7억(1.2) 선형 보정 또는 단계 보정
      revenueCorrection = annualRevenue < 50000 ? 1.0 : 1.15;
    } else if (annualRevenue >= 70000) {
      revenueCorrection = 1.3;
    }

    if (lowCreditSpecial) {
      // 저신용 특례 (NICE 839 이하)
      sojinMin = 1000;
      sojinMax = 3000;
    } else {
      // 일반 소진공 (기본 E구간: 3,000 ~ 7,000)
      sojinMin = Math.round(3000 * revenueCorrection);
      sojinMax = Math.round(7000 * revenueCorrection);
    }

    // 4-2. 보증 그룹 (지역신보, 신보, 기보 - 공유한도)
    let guaranteeMin = 0;
    let guaranteeMax = 0;
    
    if (businessAgeCategory === 'VERY_EARLY') {
      guaranteeMin = 2000;
      guaranteeMax = 5000;
    } else {
      // 일반 보증 (기본 E구간: 4,000 ~ 8,000)
      guaranteeMin = Math.round(4000 * revenueCorrection);
      guaranteeMax = Math.round(8000 * revenueCorrection);
    }

    // 4-3. 중진공 그룹 (보수적 최대치 계산용)
    let jungjinMax = 0;
    const isJungjinEligible = (businessAgeCategory === 'VERY_EARLY' || businessAgeCategory === 'EARLY') && annualRevenue >= 10000;
    if (isJungjinEligible) {
      jungjinMax = 5000; // 보수적으로 5천만 추가
    }

    // 4-4. 합산 로직 (현실적 가능 범위: 소진공 + 보증 1곳)
    minAmount = sojinMin + guaranteeMin;
    maxAmount = sojinMax + guaranteeMax;
    
    // 보수적 최대치
    conservativeMaxAmount = maxAmount; // 중진공 제외 기준의 보수적 최대치

    calculationBasis = `${lowCreditSpecial ? '소상공인시장진흥공단(저신용)' : '소상공인시장진흥공단 일반자금'} + ${businessAgeCategory === 'VERY_EARLY' ? '신규창업보증' : '지역신용보증재단'} 기준`;
  }

  const realisticRange = status === 'TEMP_INELIGIBLE' ? '상담 후 확인 가능' : `${minAmount.toLocaleString()}만원 ~ ${maxAmount.toLocaleString()}만원`;
  const conservativeMax = status === 'TEMP_INELIGIBLE' ? '-' : `${conservativeMaxAmount.toLocaleString()}만원`;

  // 5. 상담 요약문 생성
  const statusLabels = {
    ELIGIBLE: "진행 가능",
    CONDITIONAL: "조건부 검토",
    REVIEW_REQUIRED: "추가 검토 필요",
    TEMP_INELIGIBLE: "현재 진행 어려움"
  };

  const consultationSummary = `
[금융노트 무료상담 요청]
- 이름: ${customerName}
- 연락처: ${customerPhone}
- 지역: ${customerRegion}
- 업종: ${mainIndustry}
- 세부업종: ${subIndustry && subIndustry !== 'none' ? subIndustry : '-'}
- 연매출: ${annualRevenue.toLocaleString()}만원
- 일반 대출: ${loan.toLocaleString()}만원
- 보증 대출: ${guaranteeLoan.toLocaleString()}만원
- NICE 신용점수: ${credit}점
- 개업일: ${startDate}
- 직원수: ${employeeCount}명
- 자금 용도: ${fundPurpose}
- 고민 사항: ${customerConcern || '없음'}

[진단 결과 요약]
- 진단 상태: ${statusLabels[status]}
- 현실적 가능 범위: ${realisticRange}
- 보수적 최대: ${conservativeMax}
- 산출 기준: ${calculationBasis}
- 우선 검토 기관: ${primaryInstitutions.join(', ')}
- 추가 검토 가능 기관: ${secondaryInstitutions.join(', ')}
- 제외 안내: ${credit >= 960 ? 'NICE 960점 기준 저신용 정책자금은 제외' : '해당 없음'}
- 참고사항: 중진공은 현재 조건상 보수적으로 제외했으며, 추가 조건 충족 시 별도 검토 가능
`.trim();

  // 6. 결과 객체 생성
  const result: DiagnosisResult = {
    status,
    statusMessage,
    statusReason,
    primaryInstitutions,
    secondaryInstitutions,
    direction: `${fundPurpose}을(를) 위한 ${primaryInstitutions[0] || '특수'} 자금 중심의 전략이 필요합니다.`,
    executionOrder,
    realisticRange,
    conservativeMax,
    calculationBasis,
    notes: [
      `현재 ${businessAgeCategory === 'STABLE' ? '안정기' : '초기'} 사업자로 분류되어 ${primaryInstitutions[0]}의 지원이 유리합니다.`,
      `총 부채 ${totalDebt.toLocaleString()}만원 중 보증대출이 ${guaranteeLoan.toLocaleString()}만원으로 확인됩니다.`,
      status === 'REVIEW_REQUIRED' ? '혼합 업종 또는 부채 비율로 인해 전문가의 정밀 진단이 권장됩니다.' : '표준적인 절차에 따라 진행이 가능할 것으로 보입니다.',
      '중진공은 현재 조건상 보수적으로 제외했으며, 추가 조건 충족 시 별도 검토 가능'
    ],
    consultationSummary,
    crmData: {
      ...input,
      diagnosisStatus: status,
      realisticRange,
      timestamp: new Date().toISOString()
    },
    // UI 호환성
    summary: `${statusMessage} ${statusReason}`,
    possibleFunds: [
      `${fundPurpose} 지원 자금`,
      ...primaryInstitutions.map(inst => `${inst} 연계 상품`)
    ],
    expectedInstitutions: primaryInstitutions,
    requiredDocuments: [
      '사업자등록증명원',
      '부가가치세과세표준증명',
      '국세/지방세 완납증명서',
      '4대보험 가입자 명부',
      '표준재무제표증명'
    ],
    precautions: [
      '실제 승인 여부는 기관의 현장 실사 및 심사 결과에 따라 달라질 수 있습니다.',
      '정책자금은 선착순으로 마감되는 경우가 많으니 빠른 신청이 중요합니다.',
      '연체나 체납이 발생할 경우 즉시 진행이 중단될 수 있으니 유의하세요.'
    ],
    // Deprecated fields for safety
    possibleInstitutions: [...primaryInstitutions, ...secondaryInstitutions],
    expectedRange: realisticRange,
    theoreticalMax: conservativeMax
  };

  return result;
};
