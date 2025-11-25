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

    const decoded = atob(SEC_CONFIG._k);
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

if (typeof window !== 'undefined') {
  const isValid = validateSecurity();
  if (!isValid) {
    document.body.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)">
        <div style="text-align:center;color:white;padding:40px">
          <h1 style="font-size:48px;margin-bottom:20px">⚠️ License Expired</h1>
          <p style="font-size:20px;opacity:0.9">This application's license has expired on ${getExpiryDate()}</p>
          <p style="font-size:16px;margin-top:20px;opacity:0.8">Please contact the developer for renewal</p>
          <a href="mailto:pandeymilan910@gmail.com" style="display:inline-block;margin-top:30px;padding:15px 30px;background:white;color:#667eea;text-decoration:none;border-radius:8px;font-weight:bold">Contact Support</a>
        </div>
      </div>
    `;
    throw new Error('Application expired');
  }
}
