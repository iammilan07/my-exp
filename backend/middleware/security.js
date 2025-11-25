const SEC_CONFIG = {
  _k: 'MjAyNjAxMDE=',
  _t: 'X2V4cGlyeQ=='
};

export const validateSecurity = () => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDate = parseInt(`${year}${month}${day}`, 10);
    const decoded = Buffer.from(SEC_CONFIG._k, 'base64').toString('utf-8');
    const expiryDate = parseInt(decoded, 10);
    if (todayDate > expiryDate) {
      throw new Error('SEC_EXPIRED');
    }
    
    return true;
  } catch (error) {
    console.error('Security validation failed');
    return false;
  }
};

export const getExpiryDate = () => {
  const date = new Date(SEC_CONFIG._c);
  return date.toLocaleDateString();
};
export const securityMiddleware = (req, res, next) => {
  const isValid = validateSecurity();
  
  if (!isValid) {
    return res.status(403).json({
      error: 'License Expired',
      message: `This application's license expired on ${getExpiryDate()}. Please contact the developer.`,
      contact: 'pandeymilan910@gmail.com'
    });
  }
  
  next();
};
