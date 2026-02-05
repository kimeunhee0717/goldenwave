import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          개인정보처리방침
        </h1>
        <p className="text-sm text-slate-400 mb-12">
          최종 수정일: 2026년 2월 5일
        </p>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. 개인정보의 처리 목적</h2>
            <p>
              부자타임(이하 "사이트")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>뉴스레터 발송 및 이메일 서비스 제공</li>
              <li>웹사이트 이용 통계 분석 및 서비스 개선</li>
              <li>문의사항 접수 및 처리</li>
              <li>광고 게재 및 마케팅에 활용 (Google AdSense 등)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. 수집하는 개인정보 항목</h2>
            <p>사이트는 서비스 제공을 위해 아래와 같은 최소한의 개인정보를 수집합니다.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 px-4 py-3 text-left font-semibold">수집 항목</th>
                    <th className="border border-slate-200 px-4 py-3 text-left font-semibold">수집 목적</th>
                    <th className="border border-slate-200 px-4 py-3 text-left font-semibold">보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3">이메일 주소</td>
                    <td className="border border-slate-200 px-4 py-3">뉴스레터 발송</td>
                    <td className="border border-slate-200 px-4 py-3">구독 해지 시까지</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3">접속 IP, 쿠키, 방문 기록</td>
                    <td className="border border-slate-200 px-4 py-3">통계 분석 및 광고 서비스</td>
                    <td className="border border-slate-200 px-4 py-3">수집일로부터 1년</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-3">이름, 이메일, 문의 내용</td>
                    <td className="border border-slate-200 px-4 py-3">문의 응대</td>
                    <td className="border border-slate-200 px-4 py-3">처리 완료 후 3년</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. 쿠키(Cookie) 및 광고</h2>
            <p>
              사이트는 Google AdSense를 통해 광고를 게재하며, 이 과정에서 Google 및 제3자 광고 네트워크가 쿠키를 사용하여 이용자의 관심사에 기반한 광고를 제공할 수 있습니다.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Google은 DART 쿠키를 사용하여 사이트 및 타 사이트 방문 기록을 기반으로 광고를 게재합니다.</li>
              <li>이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-moss-600 hover:underline">Google 광고 설정</a>에서 맞춤 광고를 비활성화할 수 있습니다.</li>
              <li>쿠키 설정은 브라우저 설정에서 변경할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. 개인정보의 제3자 제공</h2>
            <p>
              사이트는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. 개인정보의 파기 절차 및 방법</h2>
            <p>
              사이트는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>전자적 파일:</strong> 복구 및 재생이 불가능한 방법으로 영구 삭제</li>
              <li><strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. 이용자의 권리</h2>
            <p>이용자(또는 법정대리인)는 다음과 같은 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>개인정보 열람, 정정, 삭제 요구</li>
              <li>개인정보 처리 정지 요구</li>
              <li>뉴스레터 수신 거부 (이메일 내 수신거부 링크 이용)</li>
            </ul>
            <p className="mt-3">
              위 권리 행사는 아래 연락처를 통해 요청하실 수 있으며, 지체 없이 조치하겠습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">7. 개인정보 보호책임자</h2>
            <div className="bg-slate-50 rounded-xl p-6 text-sm space-y-2">
              <p><strong>성명:</strong> 김은희</p>
              <p><strong>직위:</strong> 대표</p>
              <p><strong>이메일:</strong> kimeunhee0717@gmail.com</p>
              <p><strong>전화:</strong> 010-6289-0101</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">8. 개인정보처리방침 변경</h2>
            <p>
              이 개인정보처리방침은 2026년 2월 5일부터 적용되며, 변경 시에는 사이트 공지사항을 통해 안내드리겠습니다.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-moss-600 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
