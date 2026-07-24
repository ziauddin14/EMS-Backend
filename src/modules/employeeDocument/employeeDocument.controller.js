import employeeDocumentService from './employeeDocument.service.js';
import { ApiResponse } from '../../core/responses/index.js';

class EmployeeDocumentController {
  async upload(req, res, next) {
    try {
      const document = await employeeDocumentService.uploadDocument(req.body, req.user.userId);
      return ApiResponse.created(res, 'Document uploaded successfully', { document });
    } catch (error) {
      next(error);
    }
  }

  async replace(req, res, next) {
    try {
      const { id } = req.params;
      const document = await employeeDocumentService.replaceDocument(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Document replaced successfully', { document });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const document = await employeeDocumentService.updateDocument(id, req.body, req.user.userId);
      return ApiResponse.success(res, 'Document updated successfully', { document });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await employeeDocumentService.deleteDocument(id, req.user.userId);
      return ApiResponse.success(res, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req, res, next) {
    try {
      const { id } = req.params;
      const document = await employeeDocumentService.restoreDocument(id);
      return ApiResponse.success(res, 'Document restored successfully', { document });
    } catch (error) {
      next(error);
    }
  }

  async verify(req, res, next) {
    try {
      const { id } = req.params;
      const document = await employeeDocumentService.verifyDocument(id, req.user.userId);
      return ApiResponse.success(res, 'Document verified successfully', { document });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const document = await employeeDocumentService.getDocumentById(id);
      return ApiResponse.success(res, 'Document retrieved successfully', { document });
    } catch (error) {
      next(error);
    }
  }

  async getByEmployee(req, res, next) {
    try {
      const { employeeId } = req.params;
      const documents = await employeeDocumentService.getDocumentsByEmployee(employeeId);
      return ApiResponse.success(res, 'Employee documents retrieved successfully', { documents });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await employeeDocumentService.getAllDocuments(req.query);
      return ApiResponse.success(res, 'Documents retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { q } = req.query;
      const documents = await employeeDocumentService.searchDocuments(q, req.query);
      return ApiResponse.success(res, 'Documents found', { documents });
    } catch (error) {
      next(error);
    }
  }

  async filter(req, res, next) {
    try {
      const result = await employeeDocumentService.filterDocuments(req.query, req.query);
      return ApiResponse.success(res, 'Documents filtered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const statistics = await employeeDocumentService.getDocumentStatistics();
      return ApiResponse.success(res, 'Document statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeStatistics(req, res, next) {
    try {
      const { employeeId } = req.params;
      const statistics = await employeeDocumentService.getEmployeeDocumentStatistics(employeeId);
      return ApiResponse.success(res, 'Employee document statistics retrieved successfully', { statistics });
    } catch (error) {
      next(error);
    }
  }

  async getByType(req, res, next) {
    try {
      const { type } = req.params;
      const documents = await employeeDocumentService.getDocumentsByType(type);
      return ApiResponse.success(res, 'Documents retrieved successfully', { documents });
    } catch (error) {
      next(error);
    }
  }

  async getByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const documents = await employeeDocumentService.getDocumentsByStatus(status);
      return ApiResponse.success(res, 'Documents retrieved successfully', { documents });
    } catch (error) {
      next(error);
    }
  }

  async getVerified(req, res, next) {
    try {
      const documents = await employeeDocumentService.getVerifiedDocuments();
      return ApiResponse.success(res, 'Verified documents retrieved successfully', { documents });
    } catch (error) {
      next(error);
    }
  }

  async getPending(req, res, next) {
    try {
      const documents = await employeeDocumentService.getPendingDocuments();
      return ApiResponse.success(res, 'Pending documents retrieved successfully', { documents });
    } catch (error) {
      next(error);
    }
  }

  async getExpired(req, res, next) {
    try {
      const documents = await employeeDocumentService.getExpiredDocuments();
      return ApiResponse.success(res, 'Expired documents retrieved successfully', { documents });
    } catch (error) {
      next(error);
    }
  }

  async getExpiringSoon(req, res, next) {
    try {
      const { days } = req.params;
      const documents = await employeeDocumentService.getExpiringSoonDocuments(parseInt(days) || 30);
      return ApiResponse.success(res, 'Expiring soon documents retrieved successfully', { documents });
    } catch (error) {
      next(error);
    }
  }

  async download(req, res, next) {
    try {
      const { id } = req.params;
      const document = await employeeDocumentService.getDocumentById(id);
      return ApiResponse.success(res, 'Document download URL retrieved', { fileUrl: document.fileUrl, originalFileName: document.originalFileName });
    } catch (error) {
      next(error);
    }
  }
}

export default new EmployeeDocumentController();
