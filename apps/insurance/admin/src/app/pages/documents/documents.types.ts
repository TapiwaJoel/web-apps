/** Validation state of a single uploaded document. */
export type DocumentStatus = 'valid' | 'invalid' | 'expiring';

/** One row in the Recent Files table. */
export interface DocumentFile {
  id: string;
  type: string;
  fileId: string;
  holderName: string;
  uploadedDate: string;
  expirationDate: string;
  source: string;
  status: DocumentStatus;
}

/** One folder-style summary tile. */
export interface DocumentCategory {
  label: string;
  icon: string;
  fileCount: number;
  sizeLabel: string;
}

/** One segment of the Document Compliance stat bar. */
export interface ComplianceSegment {
  label: string;
  count: number;
  pct: number;
  tone: DocumentStatus;
}

/** One slice of the Storage Usage breakdown legend. */
export interface StorageSlice {
  label: string;
  pct: number;
  sizeLabel: string;
}

/** All mock data backing the Documents page. Swappable for a real service later. */
export interface DocumentsPageData {
  categories: DocumentCategory[];
  recentFiles: DocumentFile[];
  complianceSegments: ComplianceSegment[];
  validCount: number;
  pendingReviewCount: number;
  storage: {
    usedPct: number;
    usedLabel: string;
    totalLabel: string;
    slices: StorageSlice[];
  };
}

export const MOCK_DOCUMENTS_DATA: DocumentsPageData = {
  categories: [
    {
      label: "Driver's Licences",
      icon: '🪪',
      fileCount: 45,
      sizeLabel: '256 MB',
    },
    {
      label: 'Proof of Address',
      icon: '🏠',
      fileCount: 30,
      sizeLabel: '512 MB',
    },
    { label: 'National IDs', icon: '📇', fileCount: 12, sizeLabel: '64 MB' },
    {
      label: 'Policy Documents',
      icon: '📋',
      fileCount: 60,
      sizeLabel: '340 MB',
    },
  ],
  recentFiles: [
    {
      id: 'f-35698',
      type: "Driver's Licence",
      fileId: '#35698',
      holderName: 'Michael S.',
      uploadedDate: '18-05-25',
      expirationDate: '18-05-30',
      source: 'Uploaded by Agent',
      status: 'valid',
    },
    {
      id: 'f-35697',
      type: 'Proof of Address',
      fileId: '#35697',
      holderName: 'Sam W.',
      uploadedDate: '16-05-25',
      expirationDate: '16-05-30',
      source: 'Client',
      status: 'invalid',
    },
    {
      id: 'f-35695',
      type: "Driver's Licence",
      fileId: '#35695',
      holderName: 'Liam Johnson',
      uploadedDate: '16-05-25',
      expirationDate: '16-05-30',
      source: 'Uploaded by Agent',
      status: 'valid',
    },
    {
      id: 'f-35694',
      type: 'National ID',
      fileId: '#35694',
      holderName: 'Sophia Brown',
      uploadedDate: '12-05-25',
      expirationDate: '12-05-30',
      source: 'Auto-imported',
      status: 'expiring',
    },
    {
      id: 'f-35693',
      type: 'Proof of Address',
      fileId: '#35693',
      holderName: 'Mason Smith',
      uploadedDate: '11-05-25',
      expirationDate: '11-05-30',
      source: 'Client',
      status: 'valid',
    },
    {
      id: 'f-35692',
      type: 'Policy Document',
      fileId: '#35692',
      holderName: 'Olivia Davis',
      uploadedDate: '08-05-25',
      expirationDate: '08-05-30',
      source: 'Uploaded by Agent',
      status: 'valid',
    },
  ],
  complianceSegments: [
    { label: 'Expired', count: 5, pct: 16, tone: 'expiring' },
    { label: 'Incomplete', count: 23, pct: 62, tone: 'expiring' },
    { label: 'Invalid Doc', count: 7, pct: 22, tone: 'invalid' },
  ],
  validCount: 421,
  pendingReviewCount: 48,
  storage: {
    usedPct: 25,
    usedLabel: '124 GB',
    totalLabel: '500 GB',
    slices: [
      { label: 'Policy Documents', pct: 12, sizeLabel: '60 GB' },
      { label: "Driver's Licences", pct: 7, sizeLabel: '35 GB' },
      { label: 'Proof of Address', pct: 6, sizeLabel: '30 GB' },
    ],
  },
};
