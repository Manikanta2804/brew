# BrewDash 🚀

Food delivery platform with seller, delivery, admin panels. Real-time order tracking with Socket.io, Razorpay payments.

## ✨ Features
- User registration/login, profile, orders, tracking
- Seller dashboard, product management
- Admin panel
- Delivery boy app
- Real-time location updates
- Hiring applications
- Email/SMS notifications
- File uploads for products

## 🛠 Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Payments**: Razorpay
- **Security**: Helmet, Rate-limit, Mongo-sanitize, etc.
- **Frontend**: Vanilla HTML/CSS/JS
- **Notifications**: Nodemailer, Twilio

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas (free tier) or local MongoDB
- Razorpay test keys
- Twilio/Nodemailer credentials

### Git Workflow
```
git clone <repo-url>
cd brew-dash
git checkout -b feature/your-feature
# make changes
git add .
git commit -m "feat: your message"
git push origin feature/your-feature
# Create PR on GitHub
```

### Setup & Run
1. Clone & Install:
   ```
   git clone <your-repo-url> brew-dash
   cd brew-dash
   npm install
   ```

2. Create `.env` (copy from `.env.example` if available):
   ```
   MONGODB_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3000
   RAZORPAY_KEY_ID=your_razorpay_test_key
   RAZORPAY_KEY_SECRET=your_razorpay_test_secret
   # Email/SMS creds...
   ```

3. Run server:
   ```
   npm start
   ```

4. Open http://localhost:3000

**Admin: http://localhost:3000/admin**

## 📁 Project Structure
```
brew-dash/
├── server.js          # Entry point
├── package.json
├── public/            # Frontend HTML/CSS/JS
├── routes/           # API routes
├── controllers/      # Business logic
├── models/           # Mongoose schemas
├── middleware/       # Auth, upload, etc.
├── config/           # Email/SMS
└── uploads/          # User uploads
```

## 🤝 Contributing
1. Fork & clone
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License
ISC

