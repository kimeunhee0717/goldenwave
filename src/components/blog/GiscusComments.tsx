import Giscus from '@giscus/react'

export default function GiscusComments() {
  // TODO: 실제 GitHub 저장소 정보로 교체 필요
  // giscus.app에서 설정 후 아래 값들을 업데이트하세요
  return (
    <Giscus
      repo="kimeunhee0717/goldenwave"
      repoId="R_kgDONwz_RQ"
      category="General"
      categoryId="DIC_kwDONwz_Rc4Cm7AC"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang="ko"
      loading="lazy"
    />
  )
}
