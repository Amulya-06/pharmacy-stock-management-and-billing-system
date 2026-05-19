<div align="center">

# 💊 Pharmacy Stock Management & Billing System

**A full-stack web application to streamline pharmacy operations — from inventory tracking to billing, all in one place.**

</div>

---

## 📌 Overview

The **Pharmacy Stock Management & Billing System** is a robust full-stack web application designed to help pharmacies efficiently manage their medicine inventory and generate accurate bills. It eliminates manual record-keeping, reduces errors, and provides a clean digital interface for day-to-day pharmacy operations.

> 🌐 **Deployed & live at:** [https://pharmacy-stock-management-and-billing-krn7.onrender.com](https://pharmacy-stock-management-and-billing-krn7.onrender.com)

---

## ✨ Features

- 🗃️ **Stock Management** — Add, update, and delete medicine records with ease
- 📦 **Inventory Tracking** — Monitor stock levels and get visibility into available quantities
- 🧾 **Billing System** — Generate itemized bills for customers based on purchased medicines
- 🔍 **Search & Filter** — Quickly find medicines from the inventory
- 📊 **Dashboard View** — Get a summarized overview of stock and billing activity
- 💻 **Responsive UI** — Works seamlessly across desktop and mobile devices
- ⚡ **Real-time Updates** — Inventory reflects changes immediately after transactions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js, CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB / MySQL *(as configured)* |
| **Deployment** | Render |
| **Version Control** | Git & GitHub |

---

## 📁 Project Structure

```
pharmacy-stock-management-and-billing-system/
│
├── backend/                  # Node.js + Express REST API
│   ├── models/               # Database models/schemas
│   ├── routes/               # API route handlers
│   ├── controllers/          # Business logic
│   └── server.js             # Entry point
│
├── last/                     # React frontend source
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   └── App.js            # Root component
│   └── public/
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A running database instance (MongoDB Atlas or MySQL)

---

### 🔧 Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Amulya-06/pharmacy-stock-management-and-billing-system.git
cd pharmacy-stock-management-and-billing-system
```

#### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DB_URI=your_database_connection_string
```

Start the backend server:

```bash
npm start
```

#### 3. Setup the Frontend

```bash
cd ../last
npm install
npm start
```

The app will be running at `http://localhost:3000`

---

## 🌐 Deployment

This project is deployed on **[Render](https://render.com)**:

- **Frontend** — Served as a static React build
- **Backend** — Node.js web service

🔗 Live URL: [https://pharmacy-stock-management-and-billing-krn7.onrender.com](https://pharmacy-stock-management-and-billing-krn7.onrender.com)

> **Note:** Since it's hosted on Render's free tier, the server may take **~30–60 seconds to wake up** on the first request after inactivity.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👩‍💻 Author

**Amulya**
- GitHub: [@Amulya-06](https://github.com/Amulya-06)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

⭐ **If you found this project useful, please give it a star!** ⭐

Made with ❤️ for efficient pharmacy management

</div>
