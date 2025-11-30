import axios, { type AxiosRequestConfig, type Method } from 'axios';

export type DocumentId =
  | 'landLedger'
  | 'residentRegistration'
  | 'vehicleRegister'
  | 'buildingLedger'
  | 'familyRelation'
  | 'passportReissue'
  | 'localTax'
  | 'taxPayment';

export type GovDocumentRequestMap = {
  landLedger: {
    parcelNumber: string;
    siGunGuCode: string;
    eupMyeonDongCode: string;
  };
  residentRegistration: {
    residentRegistrationNumber: string;
    issueReason: string;
    includeAddressHistory: 'Y' | 'N';
  };
  vehicleRegister: {
    plateNumber: string;
    ownerName: string;
  };
  buildingLedger: {
    buildingId: string;
    siGunGuCode: string;
  };
  familyRelation: {
    applicantRrn: string;
    targetRelation: 'SELF' | 'SPOUSE' | 'PARENT' | 'CHILD';
  };
  passportReissue: {
    passportNumber: string;
    applicantName: string;
    contactNumber: string;
  };
  localTax: {
    taxpayerId: string;
    taxType: 'PROPERTY' | 'ACQUISITION' | 'RESIDENT';
  };
  taxPayment: {
    businessId: string;
    year: string;
    half: 'FIRST' | 'SECOND';
  };
};

type DocumentApiConfig<TPayload> = {
  path: string;
  method: Method;
  fixedParams?: Record<string, string>;
  transformPayload?: (payload: TPayload) => Record<string, unknown>;
};

const GOV24_BASE_URL =
  import.meta.env.VITE_GOV24_API_BASE_URL ?? 'https://api.gov24.example.com';
const GOV24_API_KEY = import.meta.env.VITE_GOV24_API_KEY ?? 'demo-key';

const documentApiMap: {
  [K in DocumentId]: DocumentApiConfig<GovDocumentRequestMap[K]>;
} = {
  landLedger: {
    path: '/documents/land-ledger',
    method: 'GET',
  },
  residentRegistration: {
    path: '/documents/resident-registration',
    method: 'POST',
  },
  vehicleRegister: {
    path: '/documents/vehicle-register',
    method: 'GET',
  },
  buildingLedger: {
    path: '/documents/building-ledger',
    method: 'GET',
  },
  familyRelation: {
    path: '/documents/family-relation',
    method: 'POST',
  },
  passportReissue: {
    path: '/documents/passport-reissue',
    method: 'POST',
  },
  localTax: {
    path: '/documents/local-tax-certificate',
    method: 'GET',
  },
  taxPayment: {
    path: '/documents/tax-payment',
    method: 'GET',
  },
};

export interface DocumentIssueResult<T> {
  documentId: DocumentId;
  issuedAt: string;
  requestPayload: T;
  raw: unknown;
}

function buildRequestConfig<T extends DocumentId>(
  documentId: T,
  payload: GovDocumentRequestMap[T],
): AxiosRequestConfig {
  const config = documentApiMap[documentId];
  const url = `${GOV24_BASE_URL}${config.path}`;
  const baseHeaders = {
    'x-api-key': GOV24_API_KEY,
  };

  const requestConfig: AxiosRequestConfig = {
    url,
    method: config.method,
    headers: baseHeaders,
  };

  if (config.method === 'GET') {
    requestConfig.params = {
      ...config.fixedParams,
      ...payload,
      serviceKey: GOV24_API_KEY,
    };
  } else {
    requestConfig.data = {
      ...config.fixedParams,
      ...payload,
    };
    requestConfig.headers = {
      ...baseHeaders,
      'Content-Type': 'application/json',
    };
  }

  return requestConfig;
}

export async function issueDocument<T extends DocumentId>(
  documentId: T,
  payload: GovDocumentRequestMap[T],
) {
  try {
    const axiosConfig = buildRequestConfig(documentId, payload);
    const response = await axios(axiosConfig);
    const result: DocumentIssueResult<GovDocumentRequestMap[T]> = {
      documentId,
      issuedAt: new Date().toISOString(),
      requestPayload: payload,
      raw: response.data,
    };
    return result;
  } catch (error) {
    console.error(`Failed to issue document (${documentId})`, error);
    throw error;
  }
}

export function getDocumentRequirements<T extends DocumentId>(documentId: T) {
  return documentApiMap[documentId];
}
