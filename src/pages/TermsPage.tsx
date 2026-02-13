import { Link } from 'react-router-dom';
import SEOHead from '@/components/common/SEOHead';

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SEOHead
        title="이용약관"
        description="부자타임의 서비스 이용약관입니다. 서비스 이용 전 반드시 확인해 주세요."
        url="/terms"
      />
      <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          이용약관
        </h1>
        <p className="text-sm text-slate-400 mb-12">
          최종 수정일: 2026년 2월 5일
        </p>

        <div className="prose prose-slate max-w-none space-y-10 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">제1조 (목적)</h2>
            <p>
              이 약관은 부자타임(이하 "사이트")이 제공하는 인터넷 관련 서비스(이하 "서비스")의 이용에 관한 조건 및 절차, 이용자와 사이트의 권리·의무 및 책임사항 등 기본적인 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">제2조 (정의)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>"사이트"</strong>란 부자타임(bujatime.com) 웹사이트를 말합니다.</li>
              <li><strong>"이용자"</strong>란 사이트에 접속하여 이 약관에 따라 사이트가 제공하는 서비스를 이용하는 자를 말합니다.</li>
              <li><strong>"콘텐츠"</strong>란 사이트에 게시된 글, 이미지, 영상, 파일 등 일체의 정보를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ul className="list-decimal pl-6 space-y-2">
              <li>이 약관은 사이트에 게시함으로써 효력을 발생합니다.</li>
              <li>사이트는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있습니다.</li>
              <li>변경된 약관은 사이트에 공지함으로써 효력을 발생합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">제4조 (서비스의 내용)</h2>
            <p>사이트는 다음과 같은 서비스를 제공합니다.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>AI, 재테크, 부업, 비즈니스 관련 블로그 콘텐츠 제공</li>
              <li>뉴스레터 발송 서비스</li>
              <li>각종 금융 계산기 등 유용한 도구 제공</li>
              <li>기타 사이트가 정하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">제5조 (서비스 이용)</h2>
            <ul className="list-decimal pl-6 space-y-2">
              <li>서비스는 연중무휴, 1일 24시간 운영을 원칙으로 합니다. 다만, 시스템 점검 등의 사유로 일시적으로 서비스가 중단될 수 있습니다.</li>
              <li>사이트의 콘텐츠는 정보 제공을 목적으로 하며, 투자 조언이나 금융 자문으로 간주되지 않습니다.</li>
              <li>이용자는 콘텐츠를 참고하여 내린 결정에 대해 스스로 책임을 집니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">제6조 (저작권 및 지적재산권)</h2>
            <ul className="list-decimal pl-6 space-y-2">
              <li>사이트에 게시된 모든 콘텐츠의 저작권은 사이트 운영자에게 있습니다.</li>
              <li>이용자는 사이트의 콘텐츠를 개인적이고 비상업적인 용도로만 이용할 수 있습니다.</li>
              <li>사이트의 사전 서면 동의 없이 콘텐츠를 복제, 배포, 전송, 출판, 2차 저작물 작성 등의 행위를 하여서는 안 됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">제7조 (면책 조항)</h2>
            <ul className="list-decimal pl-6 space-y-2">
              <li>사이트는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.</li>
              <li>사이트는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</li>
              <li>사이트에 게시된 정보, 자료, 사실의 신뢰도 및 정확성에 대해서는 보증하지 않으며, 이로 인해 발생한 이용자의 손해에 대해서는 책임을 지지 않습니다.</li>
              <li>특히, 재테크·투자·부업 관련 콘텐츠는 일반적인 정보 제공 목적이며, 개인의 투자 판단이나 재무적 결정에 대한 책임은 이용자 본인에게 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">제8조 (광고 게재)</h2>
            <ul className="list-decimal pl-6 space-y-2">
              <li>사이트는 서비스 운영과 관련하여 사이트 내에 광고를 게재할 수 있습니다.</li>
              <li>사이트는 Google AdSense 등 제3자 광고 서비스를 이용하며, 이를 통해 이용자에게 맞춤형 광고가 노출될 수 있습니다.</li>
              <li>광고 관련 개인정보 처리에 대한 사항은 <Link to="/privacy" className="text-moss-600 hover:underline">개인정보처리방침</Link>을 참고하시기 바랍니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">제9조 (분쟁 해결)</h2>
            <ul className="list-decimal pl-6 space-y-2">
              <li>사이트와 이용자 사이에 발생한 분쟁에 관한 소송은 대한민국 법을 준거법으로 합니다.</li>
              <li>사이트와 이용자 간에 발생한 분쟁에 대해서는 부산지방법원을 관할 법원으로 합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">부칙</h2>
            <p>이 약관은 2026년 2월 5일부터 시행합니다.</p>
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
