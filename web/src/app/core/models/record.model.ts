export type RecordType = 'EMPLOYMENT' | 'EDUCATION' | 'ADDRESS' | 'IDENTITY' | 'CRIMINAL';
export type RecordStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface VerificationRecord {
  recordId: string;
  ownerUserId: string;
  title: string;
  type: RecordType;
  status: RecordStatus;
  verifiedOn: string | null;
  createdAt: string;
  updatedAt: string;
}
