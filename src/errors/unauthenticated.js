import CustomError from "./customError.js";

class UnauthenticatedError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

export default UnauthenticatedError;
