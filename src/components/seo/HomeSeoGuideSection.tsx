/**
 * 계산 카드 영역 아래 공개 SEO 블록
 */
export function HomeSeoGuideSection() {
  return (
    <section
      className="mx-auto w-full max-w-[min(327px,100%)] border-t border-[#e8e4df] pb-8 pt-8 text-[#333]"
      aria-labelledby="home-seo-guide-lead"
    >
      <p
        id="home-seo-guide-lead"
        className="text-xl font-semibold leading-tight text-[#171717] min-[360px]:text-2xl"
      >
        고양이 급여량·칼로리, 알고 급여하기
      </p>
      <p className="mt-3 text-base leading-7 text-[#555]">
        <span className="block pl-0.5">
          고양이의{" "}
          <span className="font-semibold text-[#f8620c]">적정 급여량</span>은{" "}
          <span className="font-semibold text-[#f8620c]">
            체중, 활동량, 체형, 사료 칼로리
          </span>
          에 따라 달라져요.
        </span>
        <span className="mt-1 block pl-0.5">
          아래 기준을 참고한 뒤,{" "}
          <span className="font-semibold text-[#f8620c]">계산기</span>에서 우리
          아이에게 맞는 급여량을 확인해보세요.
        </span>
      </p>

      <div className="mt-8 space-y-8 text-base leading-8 text-[#333]">
        <div>
          <h2 className="text-xl font-semibold leading-tight text-[#171717] min-[360px]:text-2xl">
            고양이 사료 급여량은 어떻게 계산하나요?
          </h2>
          <p className="mt-3">
            체중·체형(BCS)·활동량·중성화 여부를 입력한 뒤, 급여 중인 건식·습식
            이름과 급여 그램·횟수를 적으면 총 섭취 칼로리와 권장 칼로리 차이를
            비교합니다. 라벨의 평균 표만 따라가면 같은 체중이라도 과급여가
            생기기 쉬워, 검색해서 찾은 “대략 그램”보다 우리 아이 급여량을
            기준으로 계산하는 것이 좋습니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold leading-tight text-[#171717] min-[360px]:text-2xl">
            고양이 하루 권장 칼로리 기준
          </h2>
          <p className="mt-3">
            권장 칼로리는 기초 대사량(RER)에 생활·체형 계수를 곱해 만든 “평균에
            가까운 일일 에너지 예산”입니다. 따라서 결과는 진단이 아니라 출발점
            으로 보고, 2주 단위로 체중·외형 반응을 보며 미세 조정하는 방식이
            안전합니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold leading-tight text-[#171717] min-[360px]:text-2xl">
            건식과 습식 급여량이 다른 이유
          </h2>
          <p className="mt-3">
            무게가 같아도 건식은 칼로리가 그램당 더 몰린 경우가 많고, 습식은 수분이
            많아 에너지 밀도가 낮습니다. 그래서 “한 그릇”이나 “컵 반 컵” 식 표현은
            합계 칼로리를 속이기 쉽습니다. 혼합 급여일 때는 각각 그램·횟수를 적어
            합계로 검증하고, 사료를 바꿀 때는 급여 그램을 다시 맞추는 것이
            좋습니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold leading-tight text-[#171717] min-[360px]:text-2xl">
            간식도 급여량 계산에 포함해야 하나요?
          </h2>
          <p className="mt-3">
            네. 트릿·토핑·영양 간식까지 하루 칼로리에 넣어야 본식을 줄였는지
            판단할 수 있습니다. 간식만 빼고 계산하면 사료가 과해지고, 체중이
            불안하게 오를 때 원인 추적도 어려워집니다.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold leading-tight text-[#171717] min-[360px]:text-2xl">
            급여량이 부족하거나 많을 때 어떻게 조정해야 하나요?
          </h2>
          <p className="mt-3">
            한 번에 크게 바꾸기보다, 간식·토핑을 먼저 정리하고 본식 그램을 작은
            단계로 바꿉니다. 체중이 목표보다 빠르게 오르면 감량 전략이 필요하지만,
            고양이에겐 과도한 제한도 위험할 수 있어 체형과 변 상태를 함께 봐야
            합니다. 중성화 이후나 체중 목표가 바뀌었다면 같은 절차로 다시
            계산해 보세요.
          </p>
        </div>
      </div>
    </section>
  );
}
