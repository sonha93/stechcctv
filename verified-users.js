// ==========================
// VERIFIED USERS SYSTEM
// ==========================

export const VERIFIED_USERS = {

  // UID Firebase : Tên huy hiệu

  "YuqmtdI6KIQHVp3j7HknPofQGon1": "HOÀNG ANH SƠN",

  "UID_ADMIN_2": "Admin",

  "UID_KTV": "Kỹ thuật viên"

};

// Kiểm tra có xác minh không
export function isVerified(uid){
  return !!VERIFIED_USERS[uid];
}

// Lấy tên huy hiệu
export function getVerifiedBadge(uid){

  if(!VERIFIED_USERS[uid]) return "";

  const label = VERIFIED_USERS[uid];

  return `
  <span class="verified-badge">

    <svg class="verified-icon" viewBox="0 0 24 24">
      <path fill="#0866FF"
      d="M12 0l2.6 2.1 3.3-.6 1.6 3 3.3.7-.7 3.3 2.1 2.5-2.1 2.5.7 3.3-3.3.7-1.6 3-3.3-.6L12 24l-2.6-2.1-3.3.6-1.6-3-3.3-.7.7-3.3L0 12l2.1-2.5-.7-3.3 3.3-.7 1.6-3 3.3.6z"/>
      <path fill="#fff"
      d="M10.2 15.8l-3-3 1.4-1.4 1.6 1.6 5-5 1.4 1.4z"/>
    </svg>

  <div class="verified-popup-title">

  <svg class="verified-popup-icon" viewBox="0 0 24 24">
    <path fill="#0866FF"
      d="M12 0l2.6 2.1 3.3-.6 1.6 3 3.3.7-.7 3.3 2.1 2.5-2.1 2.5.7 3.3-3.3.7-1.6 3-3.3-.6L12 24l-2.6-2.1-3.3.6-1.6-3-3.3-.7.7-3.3L0 12l2.1-2.5-.7-3.3 3.3-.7 1.6-3 3.3.6z"/>
    <path fill="#fff"
      d="M10.2 15.8l-3-3 1.4-1.4 1.6 1.6 5-5 1.4 1.4z"/>
  </svg>

  <span>Tài khoản đã xác minh</span>

</div>
    </div>

  </span>
  `;
}
