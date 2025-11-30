import { useMemo, useState } from 'react'
import './App.css'
import {
  issueDocument,
  type DocumentId,
  type DocumentIssueResult,
  type GovDocumentRequestMap,
} from './services/govDocumentService'

type ServiceType = 'pdf' | 'link' | 'edit'

interface DocumentDefinition<T extends DocumentId = DocumentId> {
  id: T
  name: string
  type: ServiceType
  description: string
  payload: GovDocumentRequestMap[T]
}

const documents = [
  {
    id: 'landLedger',
    name: '토지(임야)대장',
    type: 'pdf',
    description: '지번 기반 토지현황',
    payload: {
      parcelNumber: '123-45',
      siGunGuCode: '41190',
      eupMyeonDongCode: '10300',
    },
  },
  {
    id: 'residentRegistration',
    name: '주민등록등본(초본)',
    type: 'pdf',
    description: '세대 정보/주소 포함',
    payload: {
      residentRegistrationNumber: '900101-1234567',
      issueReason: '전입신고',
      includeAddressHistory: 'Y',
    },
  },
  {
    id: 'vehicleRegister',
    name: '자동차등록원부',
    type: 'pdf',
    description: '차량 소유/저당 정보',
    payload: {
      plateNumber: '12가3456',
      ownerName: '홍길동',
    },
  },
  {
    id: 'buildingLedger',
    name: '건축물대장',
    type: 'pdf',
    description: '건축물 개요 및 면적',
    payload: {
      buildingId: '116801330010123',
      siGunGuCode: '11680',
    },
  },
  {
    id: 'familyRelation',
    name: '가족관계증명서',
    type: 'link',
    description: '본인 및 직계가족',
    payload: {
      applicantRrn: '900101-1234567',
      targetRelation: 'SELF',
    },
  },
  {
    id: 'passportReissue',
    name: '여권 재발급',
    type: 'edit',
    description: '기존 여권 재발급',
    payload: {
      passportNumber: 'M12345678',
      applicantName: 'HONG GILDONG',
      contactNumber: '010-1234-5678',
    },
  },
  {
    id: 'localTax',
    name: '지방세 납세증명',
    type: 'pdf',
    description: '지방세 완납 증명',
    payload: {
      taxpayerId: '111101-1234567',
      taxType: 'PROPERTY',
    },
  },
  {
    id: 'taxPayment',
    name: '납세증명',
    type: 'pdf',
    description: '국세 완납 증명',
    payload: {
      businessId: '123-45-67890',
      year: '2024',
      half: 'SECOND',
    },
  },
] satisfies DocumentDefinition[]

type DocumentStatus = {
  state: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

function App() {
  const [documentStates, setDocumentStates] = useState<
    Record<DocumentId, DocumentStatus>
  >(() =>
    documents.reduce(
      (acc, doc) => ({ ...acc, [doc.id]: { state: 'idle' } }),
      {} as Record<DocumentId, DocumentStatus>,
    ),
  )
  const [activeResponse, setActiveResponse] =
    useState<DocumentIssueResult<GovDocumentRequestMap[DocumentId]> | null>(
      null,
    )
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const statusLabelMap: Record<DocumentStatus['state'], string> = {
    idle: '발급 대기',
    loading: '발급 중...',
    success: '발급 완료',
    error: '발급 실패',
  }

  const handleIssueDocument = async <T extends DocumentId>(
    document: DocumentDefinition<T>,
  ) => {
    setErrorDetails(null)
    setDocumentStates((prev) => ({
      ...prev,
      [document.id]: { state: 'loading' },
    }))

    try {
      const result = await issueDocument(document.id, document.payload)
      setDocumentStates((prev) => ({
        ...prev,
        [document.id]: {
          state: 'success',
          message: result.issuedAt,
        },
      }))
      setActiveResponse(result)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'API 요청 중 문제가 발생했습니다.'
      setDocumentStates((prev) => ({
        ...prev,
        [document.id]: { state: 'error', message },
      }))
      setErrorDetails(message)
    }
  }

  const lastIssuedDocName = useMemo(() => {
    if (!activeResponse) return ''
    const target = documents.find((doc) => doc.id === activeResponse.documentId)
    return target?.name ?? activeResponse.documentId
  }, [activeResponse])

  return (
    <div className="app">
      <div className="service-card">
        <header className="service-card__header">
          <div>
            <p className="service-card__label">자주 찾는 서비스</p>
          </div>
        </header>
        <div className="service-grid">
          {documents.map((service) => {
            const status = documentStates[service.id]
            return (
              <button
                className="service-tile"
                key={service.id}
                type="button"
                onClick={() => handleIssueDocument(service)}
                disabled={status.state === 'loading'}
              >
                <div className="service-copy">
                  <span className="service-name">{service.name}</span>
                  <span className={`service-status service-${status.state}`}>
                    {statusLabelMap[status.state]}
                  </span>
                </div>
                <span
                  className={`service-icon service-icon--${service.type}`}
                  aria-hidden="true"
                >
                  {service.type === 'pdf' && 'PDF'}
                  {service.type === 'link' && '↗'}
                  {service.type === 'edit' && '✎'}
                </span>
              </button>
            )
          })}
        </div>
        <section className="issuance-panel" aria-live="polite">
          <h2>발급 상태</h2>
          {activeResponse ? (
            <>
              <p>
                {lastIssuedDocName} · {new Date(activeResponse.issuedAt).toLocaleString()}
              </p>
              <details>
                <summary>요청 본문 확인</summary>
                <pre>{JSON.stringify(activeResponse.requestPayload, null, 2)}</pre>
              </details>
            </>
          ) : (
            <p>발급 버튼을 누르면 상태가 표시됩니다.</p>
          )}
          {errorDetails && (
            <p className="error-text">오류: {errorDetails}</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default App
