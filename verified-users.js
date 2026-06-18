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
    ...
  </svg>

  <div class="verified-popup">

    <div class="verified-popup-title">

      <svg class="verified-popup-icon" viewBox="0 0 24 24">
        ...
      </svg>

      <span>Tài khoản đã xác minh</span>

    </div>

    <div class="verified-popup-text">
      Tài khoản này đã được Stech xác minh.
    </div>

  </div>

</span>
`;
