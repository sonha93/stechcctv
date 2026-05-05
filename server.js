const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // frontend files

// In-memory "database" demo
let users = []; // { email, password, verified: false, otp }

// Route đăng ký
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Kiểm tra tồn tại user
  if(users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email đã tồn tại' });
  }

  // Tạo OTP ngẫu nhiên 6 số
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Lưu user tạm thời
  users.push({ email, password, verified: false, otp });

  try {
    // Gọi API Oazalo để gửi OTP
    await axios.post('https://api.oazalo.com/send', {
      to: email,
      message: `Mã kích hoạt của bạn là: ${otp}`
    }, {
      headers: { 'Authorization': 'Bearer YOUR_OAZALO_KEY' }
    });

    res.json({ message: 'Đăng ký thành công, kiểm tra email để kích hoạt!' });
  } catch(err) {
    console.log(err.message);
    res.status(500).json({ message: 'Không gửi được OTP' });
  }
});

// Route kích hoạt OTP
app.post('/verify', (req, res) => {
  const { email, otp } = req.body;

  const user = users.find(u => u.email === email);
  if(!user) return res.status(400).json({ message: 'User không tồn tại' });

  if(user.otp == otp) {
    user.verified = true;
    user.otp = null; // xóa OTP
    return res.json({ message: 'Kích hoạt thành công!' });
  } else {
    return res.status(400).json({ message: 'OTP không đúng' });
  }
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));