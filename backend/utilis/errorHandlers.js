import AppError from './appError.js';

export const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

export const handleDuplicateFieldsDB = (err) => {
  // If we have key-value pairs (MongoDB 4+), we can inspect them
  if (err.keyValue) {
    const keys = Object.keys(err.keyValue);
    
    // Specifically handle the unique constraint for User + Tour (Reviews/Bookings)
    if (keys.includes('tour') && keys.includes('user')) {
      return new AppError('You have already submitted a review for this tour.', 400);
    }
    
    // Generic handling for other duplicates like email
    const values = Object.values(err.keyValue).join(', ');
    return new AppError(`The value "${values}" is already in use. Please use another value!`, 400);
  }

  // Fallback for older MongoDB versions
  const match = err.message.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : 'duplicate value';
  return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
};

export const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = errors.join(' ');
  return new AppError(message, 400);
};

export const jsonWebTokenError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};
export const tokenExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401);
};
