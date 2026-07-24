/**
 * Centralized API Response System
 * Standardizes all API responses across the application
 */
class ApiResponse {
  /**
   * Send success response (200)
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {Object} data - Response data (optional)
   * @param {Object} meta - Metadata (optional)
   */
  static success(res, message, data = null, meta = {}) {
    const response = {
      success: true,
      message,
      data,
      meta
    };
    return res.status(200).json(response);
  }

  /**
   * Send created response (201)
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {Object} data - Response data (optional)
   * @param {Object} meta - Metadata (optional)
   */
  static created(res, message, data = null, meta = {}) {
    const response = {
      success: true,
      message,
      data,
      meta
    };
    return res.status(201).json(response);
  }

  /**
   * Send updated response (200)
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {Object} data - Response data (optional)
   * @param {Object} meta - Metadata (optional)
   */
  static updated(res, message, data = null, meta = {}) {
    const response = {
      success: true,
      message,
      data,
      meta
    };
    return res.status(200).json(response);
  }

  /**
   * Send deleted response (200)
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {Object} meta - Metadata (optional)
   */
  static deleted(res, message, meta = {}) {
    const response = {
      success: true,
      message,
      meta
    };
    return res.status(200).json(response);
  }

  /**
   * Send bad request response (400)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Array} errors - Validation errors (optional)
   * @param {Object} meta - Metadata (optional)
   */
  static badRequest(res, message, errors = [], meta = {}) {
    const response = {
      success: false,
      message,
      errors,
      meta
    };
    return res.status(400).json(response);
  }

  /**
   * Send unauthorized response (401)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Object} meta - Metadata (optional)
   */
  static unauthorized(res, message = 'Unauthorized', meta = {}) {
    const response = {
      success: false,
      message,
      meta
    };
    return res.status(401).json(response);
  }

  /**
   * Send forbidden response (403)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Object} meta - Metadata (optional)
   */
  static forbidden(res, message = 'Forbidden', meta = {}) {
    const response = {
      success: false,
      message,
      meta
    };
    return res.status(403).json(response);
  }

  /**
   * Send not found response (404)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Object} meta - Metadata (optional)
   */
  static notFound(res, message = 'Resource not found', meta = {}) {
    const response = {
      success: false,
      message,
      meta
    };
    return res.status(404).json(response);
  }

  /**
   * Send conflict response (409)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Object} meta - Metadata (optional)
   */
  static conflict(res, message, meta = {}) {
    const response = {
      success: false,
      message,
      meta
    };
    return res.status(409).json(response);
  }

  /**
   * Send server error response (500)
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {Object} meta - Metadata (optional)
   */
  static serverError(res, message = 'Internal server error', meta = {}) {
    const response = {
      success: false,
      message,
      meta
    };
    return res.status(500).json(response);
  }
}

export default ApiResponse;
