# MIMS - Medical Inventory Management System

## What is This Project?

MIMS (Medical Inventory Management System) is a web-based application designed to manage and track medical supplies, medicines, and equipment inventory in healthcare facilities. The system helps hospitals, clinics, and pharmacies maintain accurate records of their stock levels, manage medicine information, handle billing operations, and monitor inventory in real-time.

## Why is This Important?

Medical inventory management is critical for healthcare operations because:

- **Patient Safety**: Ensures availability of essential medicines and supplies when needed, preventing treatment delays
- **Cost Control**: Reduces waste from expired medicines and prevents overstocking or understocking
- **Error Prevention**: Minimizes manual record-keeping errors through automated tracking
- **Compliance**: Maintains accurate records required for healthcare regulations
- **Operational Efficiency**: Streamlines inventory processes, freeing up staff time for patient care

## Industry Applications

This system can be used by:

- Hospitals and medical centers for managing large-scale medical supplies
- Private clinics and lying-in clinics for tracking medicine inventory
- Pharmacies and drugstores for stock management and sales tracking
- Medical supply distributors for inventory monitoring
- Healthcare facilities requiring billing and stock reporting

---

## Tech Stack

**Frontend:**

- React 18 with TypeScript
- Vite (Build tool)
- Tailwind CSS
- Shadcn/ui components

**Backend:**

- Node.js with Express
- TypeScript (backend) and JavaScript (backend_mongodb)
- MongoDB database
- Mongoose ODM

**Deployment:**

- Vercel-ready configuration

---

## Features

Based on the project structure:

- Medicine inventory tracking and management
- Store/pharmacy management
- Billing system
- Real-time stock updates
- Medicine information (dosage, expiry tracking)
- Query API for inventory searches
- User authentication middleware
- Dark/light theme support

---

## If You Want to Test This Project, Do These Steps:

### Prerequisites

Ensure you have installed:

- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas account)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Abhisheksuwalka/MIMS.git
cd "MIMS Medical Inventory Management System"
```

### 2. Set Up the MongoDB Backend

```bash
cd backend_mongodb
npm install
```

Create a `.env` file in `backend_mongodb` directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Start the MongoDB backend:

```bash
npm start
```

The backend will run on `http://localhost:5000`

### 3. Set Up the TypeScript Backend (Optional)

```bash
cd ../backend
npm install
```

Configure environment variables, CHANGE PORT as needed, then:

```bash
npm run dev
```

### 4. Set Up the Frontend

```bash
cd ../VITE_frontend
npm install
```

Create a `.env` file in `VITE_frontend` directory based on `src/env.tsx`:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (default Vite port)

### 5. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

---

## Project Structure

```
MIMS Medical Inventory Management System/
├── VITE_frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Application pages
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   └── assets/         # Images and static files
│   └── package.json
│
├── backend/                # TypeScript backend
│   ├── api/
│   └── package.json
│
└── backend_mongodb/        # MongoDB backend
    ├── api/                # API entry point
    ├── routes/             # Medicine and store routes
    ├── schema/             # Mongoose schemas
    ├── middleware/         # Authentication & validation
    └── configDB/           # Database configuration
```

---

## API Endpoints

The backend provides routes for:

- **Medicine Routes** (`/api/medicine`): CRUD operations for medicine inventory
- **Store Routes** (`/api/store`): Store management operations
- **Query API**: Search and filter inventory

Refer to `backend_mongodb/routes/` for detailed endpoint implementations.

---

## Building for Production

### Frontend

```bash
cd VITE_frontend
npm run build
```

Build output will be in `VITE_frontend/dist/`

### Backend

The project includes `vercel.json` configurations for deployment to Vercel.

---

## Database Schema

The system uses MongoDB with the following collections:

- **Medicine**: Stores medicine details (name, quantity, expiry, dosage)
- **Store**: Manages store/pharmacy information
- **Billing**: Tracks sales and billing records

Schema definitions are located in `backend_mongodb/schema/`

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Contact

For any inquiries or project-related questions, feel free to reach out:

- **LinkedIn**: [Abhishek S.](https://in.linkedin.com/in/abhisheksuwalka)
- **Email**: [suwalkabhishek@gmail.com](mailto:suwalkabhishek@gmail.com)

---
