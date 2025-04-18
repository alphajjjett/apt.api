# Inter-Unit Car Booking

Inter-Unit Car Booking is a web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows users to reserve and manage vehicles for inter-departmental use. The system includes user authentication, admin management, and a responsive frontend interface.

## Features

- User authentication (login/register)
- Vehicle booking system
- Admin dashboard to manage cars and bookings
- View and cancel reservations
- Responsive user interface
- JWT-based secure API

## Tech Stack

- **Frontend:** React.js, Tailwind CSS (or your chosen styling library)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** (Optional: Render, Vercel, or your preferred platform)

## Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB database (local or Atlas)
- `.env` file with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/inter-unit-car-booking.git
cd inter-unit-car-booking
```

2. **Backend setup:**

```bash
cd backend
npm install
npm run dev
```

3. **Frontend setup:**

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## Folder Structure

```
inter-unit-car-booking/
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── components/
│   ├── pages/
│   └── App.js
```
## Author

Developed by [alphajjjet]
GitHub: [github.com/alphajjjet](https://github.com/alphajjjet)
```

