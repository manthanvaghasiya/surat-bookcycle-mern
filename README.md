# 📚 Surat BookCycle

**Surat BookCycle** is a full-stack MERN application designed to facilitate the buying and selling of used books within the Surat community. It serves as a marketplace where students and readers can list their old books, discover affordable reads, and connect securely.

## 🚀 Live Demo
*(If you deploy this later, put the link here. For now, you can say:)*
> Currently running locally for development.

## ✨ Key Features

### 👤 User Features
* **Authentication:** Secure Login & Registration using JWT (JSON Web Tokens).
* **Marketplace:** Browse, search, and filter books by title or author.
* **Selling:** List books with details and image uploads (Local storage with Multer).
* **Dashboard:** Manage active listings, edit details, or remove sold items.
* **Order System:** Buy books, track order status (Pending/Completed), and view purchase history.
* **Responsive UI:** Modern, clean interface built with React and CSS Variables.

### 🛡️ Admin Features
* **Admin Dashboard:** dedicated panel to oversee the platform.
* **Content Management:** Ability to delete inappropriate book listings.
* **Order Oversight:** View all transactions on the platform.
* **Messages:** Read and reply to "Contact Us" form submissions.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Hooks, Context API)
* React Router DOM (Navigation)
* Axios (API Requests)
* React Toastify (Notifications)
* CSS3 (Modern Variables, Flexbox, Grid)

**Backend:**
* Node.js & Express.js
* MongoDB (Atlas Cloud Database)
* Mongoose (ODM)
* JWT (Authentication)
* BcryptJS (Password Hashing)
* Multer (Image Uploads)

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites
* Node.js installed.
* MongoDB Atlas Account (or local MongoDB).

### 2. Clone the Repository
```bash
git clone [https://github.com/your-username/surat-bookcycle.git](https://github.com/manthanvaghasiya/surat-bookcycle.git)
cd surat-bookcycle
3. Backend Setup
Navigate to the backend folder and install dependencies.

Bash

cd backend
npm install
Configure Environment Variables: Create a .env file inside the backend folder and add the following:

Code snippet

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
Start the Server:

Bash

npm run dev
(Server runs on http://localhost:5000)

4. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies.

Bash

cd ../frontend
npm install
Start the React App:

Bash

npm start
(Client runs on http://localhost:3000)

📂 Project Structure
Plaintext

surat-bookcycle/
├── backend/
│   ├── config/         # DB Connection
│   ├── controllers/    # Logic (Books, Users, Orders)
│   ├── middleware/     # Auth & Upload checks
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # API Endpoints
│   └── uploads/        # Image storage
│
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI (Header, Card)
    │   ├── context/    # Auth State Management
    │   ├── pages/      # Full Pages (Home, Dashboard)
    │   └── App.js      # Routing
🔐 Admin Access
By default, new users are not admins. To access the Admin Panel:

Register a new user on the website.

Go to your MongoDB Database (Atlas).

Find the user in the users collection.

Add the field: isAdmin: true.

Log out and log back in to see the "Admin" link in the Navbar.

🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

📝 License
This project is open-source and available under the MIT License.

Designed & Developed by Manthan 