import employeeDocumentRepository from './employeeDocument.repository.js';
import { DOCUMENT_MESSAGES, DOCUMENT_STATUS, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './employeeDocument.constants.js';
import AppError from '../../core/errors/AppError.js';

class EmployeeDocumentService {
  async uploadDocument(documentData, uploadedBy) {
    const Employee = (await import('../employee/employee.model.js')).default;

    const employeeExists = await Employee.exists({ _id: documentData.employee, isDeleted: false });
    if (!employeeExists) {
      throw new AppError(DOCUMENT_MESSAGES.INVALID_EMPLOYEE, 404);
    }

    if (!ALLOWED_FILE_TYPES.includes(documentData.mimeType)) {
      throw new AppError(DOCUMENT_MESSAGES.INVALID_FILE_TYPE, 400);
    }

    if (documentData.fileSize > MAX_FILE_SIZE) {
      throw new AppError(DOCUMENT_MESSAGES.FILE_TOO_LARGE, 400);
    }

    const existingDocument = await employeeDocumentRepository.findByEmployeeAndType(
      documentData.employee,
      documentData.documentType
    );
    if (existingDocument) {
      throw new AppError(DOCUMENT_MESSAGES.DOCUMENT_ALREADY_EXISTS, 409);
    }

    const document = await employeeDocumentRepository.create({
      ...documentData,
      uploadedBy,
      createdBy: uploadedBy
    });

    return document;
  }

  async replaceDocument(documentId, newFileData, uploadedBy) {
    const document = await employeeDocumentRepository.findById(documentId);
    if (!document) {
      throw new AppError(DOCUMENT_MESSAGES.DOCUMENT_NOT_FOUND, 404);
    }

    if (!ALLOWED_FILE_TYPES.includes(newFileData.mimeType)) {
      throw new AppError(DOCUMENT_MESSAGES.INVALID_FILE_TYPE, 400);
    }

    if (newFileData.fileSize > MAX_FILE_SIZE) {
      throw new AppError(DOCUMENT_MESSAGES.FILE_TOO_LARGE, 400);
    }

    await employeeDocumentRepository.incrementVersion(documentId);

    const updatedDocument = await employeeDocumentRepository.updateById(documentId, {
      ...newFileData,
      status: DOCUMENT_STATUS.PENDING,
      isVerified: false,
      verifiedBy: null,
      verifiedAt: null,
      updatedBy: uploadedBy
    });

    return updatedDocument;
  }

  async deleteDocument(documentId, deletedBy) {
    const document = await employeeDocumentRepository.findById(documentId);
    if (!document) {
      throw new AppError(DOCUMENT_MESSAGES.DOCUMENT_NOT_FOUND, 404);
    }

    if (document.isVerified) {
      throw new AppError(DOCUMENT_MESSAGES.CANNOT_DELETE_VERIFIED, 400);
    }

    await employeeDocumentRepository.softDeleteById(documentId, deletedBy);
  }

  async restoreDocument(documentId) {
    const document = await employeeDocumentRepository.restoreById(documentId);
    if (!document) {
      throw new AppError(DOCUMENT_MESSAGES.DOCUMENT_NOT_FOUND, 404);
    }
    return document;
  }

  async verifyDocument(documentId, verifiedBy) {
    const document = await employeeDocumentRepository.findById(documentId);
    if (!document) {
      throw new AppError(DOCUMENT_MESSAGES.DOCUMENT_NOT_FOUND, 404);
    }

    if (!document.canBeVerified()) {
      throw new AppError(DOCUMENT_MESSAGES.CANNOT_VERIFY, 400);
    }

    const verifiedDocument = await employeeDocumentRepository.verifyDocument(documentId, verifiedBy);
    return verifiedDocument;
  }

  async getDocumentById(documentId) {
    const document = await employeeDocumentRepository.findById(documentId);
    if (!document) {
      throw new AppError(DOCUMENT_MESSAGES.DOCUMENT_NOT_FOUND, 404);
    }
    return document;
  }

  async getDocumentsByEmployee(employeeId) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError(DOCUMENT_MESSAGES.INVALID_EMPLOYEE, 404);
    }

    return employeeDocumentRepository.findByEmployee(employeeId);
  }

  async getAllDocuments(query = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    };

    const documents = await employeeDocumentRepository.findWithPagination({}, options);
    const total = await employeeDocumentRepository.countDocuments();

    return {
      documents,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
        hasNext: options.page < Math.ceil(total / options.limit),
        hasPrevious: options.page > 1
      }
    };
  }

  async searchDocuments(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const searchOptions = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const documents = await employeeDocumentRepository.search(searchTerm, searchOptions);
    return documents;
  }

  async filterDocuments(filters, options = {}) {
    const query = {};
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    if (filters.employee) query.employee = filters.employee;
    if (filters.documentType) query.documentType = filters.documentType;
    if (filters.status) query.status = filters.status;
    if (filters.isVerified !== undefined) query.isVerified = filters.isVerified === 'true';
    if (filters.uploadedBy) query.uploadedBy = filters.uploadedBy;

    const paginationOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    };

    const documents = await employeeDocumentRepository.findWithPagination(query, paginationOptions);
    const total = await employeeDocumentRepository.countDocuments(query);

    return {
      documents,
      pagination: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        total,
        totalPages: Math.ceil(total / paginationOptions.limit),
        hasNext: paginationOptions.page < Math.ceil(total / paginationOptions.limit),
        hasPrevious: paginationOptions.page > 1
      }
    };
  }

  async getDocumentStatistics() {
    return employeeDocumentRepository.getStatistics();
  }

  async getEmployeeDocumentStatistics(employeeId) {
    const Employee = (await import('../employee/employee.model.js')).default;
    const employeeExists = await Employee.exists({ _id: employeeId, isDeleted: false });
    if (!employeeExists) {
      throw new AppError(DOCUMENT_MESSAGES.INVALID_EMPLOYEE, 404);
    }

    const documents = await employeeDocumentRepository.findByEmployee(employeeId);
    const total = documents.length;
    const verified = documents.filter(d => d.isVerified).length;
    const pending = documents.filter(d => d.status === DOCUMENT_STATUS.PENDING).length;
    const expired = documents.filter(d => d.isExpired).length;

    return {
      total,
      byStatus: {
        verified,
        pending,
        rejected: documents.filter(d => d.status === DOCUMENT_STATUS.REJECTED).length,
        expired
      }
    };
  }

  async getDocumentsByType(documentType) {
    return employeeDocumentRepository.findByDocumentType(documentType);
  }

  async getDocumentsByStatus(status) {
    return employeeDocumentRepository.findByStatus(status);
  }

  async getVerifiedDocuments() {
    return employeeDocumentRepository.findVerified();
  }

  async getPendingDocuments() {
    return employeeDocumentRepository.findPending();
  }

  async getExpiredDocuments() {
    return employeeDocumentRepository.findExpired();
  }

  async getExpiringSoonDocuments(days = 30) {
    return employeeDocumentRepository.findExpiringSoon(days);
  }

  async updateDocument(documentId, updateData, updatedBy) {
    const document = await employeeDocumentRepository.findById(documentId);
    if (!document) {
      throw new AppError(DOCUMENT_MESSAGES.DOCUMENT_NOT_FOUND, 404);
    }

    if (updateData.documentType) {
      const existingDocument = await employeeDocumentRepository.findByEmployeeAndType(
        document.employee,
        updateData.documentType
      );
      if (existingDocument && existingDocument._id.toString() !== documentId) {
        throw new AppError(DOCUMENT_MESSAGES.DOCUMENT_ALREADY_EXISTS, 409);
      }
    }

    const updatedDocument = await employeeDocumentRepository.updateById(documentId, {
      ...updateData,
      updatedBy
    });

    return updatedDocument;
  }
}

export default new EmployeeDocumentService();
