class AppError extends Error {
  constructor(status, message, details){
    super(message);
    this.status = status;
    this.details = details;
  }

  static badRequest(message, details){
    return new AppError(400, message, details);
  }

  static unauthorized(message='Authentication required'){
    return new AppError(401, message);
  }

  static forbidden(message='You do not have permission to perform this action'){
    return new AppError(403, message);
  }

  static notFound(message='Resource not found'){
    return new AppError(404, message);
  }
}

module.exports = {
  AppError,
};
