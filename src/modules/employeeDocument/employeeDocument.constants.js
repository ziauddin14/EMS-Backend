export const COLLECTION_NAME = 'employee_documents';

export const DOCUMENT_TYPE = {
  CNIC: 'cnic',
  PASSPORT: 'passport',
  RESUME: 'resume',
  CV: 'cv',
  APPOINTMENT_LETTER: 'appointment_letter',
  EMPLOYMENT_AGREEMENT: 'employment_agreement',
  OFFER_LETTER: 'offer_letter',
  EXPERIENCE_LETTER: 'experience_letter',
  EDUCATIONAL_CERTIFICATE: 'educational_certificate',
  PROFESSIONAL_CERTIFICATE: 'professional_certificate',
  SALARY_SLIP: 'salary_slip',
  PERFORMANCE_REVIEW: 'performance_review',
  WARNING_LETTER: 'warning_letter',
  PROMOTION_LETTER: 'promotion_letter',
  MEDICAL_CERTIFICATE: 'medical_certificate',
  OTHER: 'other'
};

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DOCUMENT_MESSAGES = {
  DOCUMENT_UPLOADED: 'Document uploaded successfully',
  DOCUMENT_UPDATED: 'Document updated successfully',
  DOCUMENT_DELETED: 'Document deleted successfully',
  DOCUMENT_RESTORED: 'Document restored successfully',
  DOCUMENT_VERIFIED: 'Document verified successfully',
  DOCUMENT_NOT_FOUND: 'Document not found',
  DOCUMENT_ALREADY_EXISTS: 'Document of this type already exists',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_EMPLOYEE: 'Employee not found or inactive',
  INVALID_DOCUMENT_TYPE: 'Invalid document type',
  CANNOT_VERIFY: 'Cannot verify document',
  CANNOT_DELETE_VERIFIED: 'Cannot delete verified document'
};
