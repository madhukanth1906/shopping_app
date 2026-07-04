const otpStore = globalThis.otpStore || new Map();
if (process.env.NODE_ENV !== 'production') {
  globalThis.otpStore = otpStore;
}
export default otpStore;
