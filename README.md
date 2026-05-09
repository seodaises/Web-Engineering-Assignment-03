# RoomSync: Roommate Profiles

SPA for discovering and managing roommate profiles in Lahore. Built as Assignment 03 for the Web Engineering.

## 🌐 Live Demo

🔗 [https://roomsync-b10a6.web.app/](https://roomsync-b10a6.web.app/)

## 👤 Author

**Khawla**, SAP ID: 70145895
6th Semester
Web Engineering D

## ✨ Features

- ✅ SPA routing with dynamic routes (`/view/:id`, `/edit/:id`)
- ✅ Full CRUD operations on Firestore
- ✅ Real-time data sync with `onSnapshot`
- ✅ Light/Dark mode toggle
- ✅ Responsive design
- ✅ Form validation
- ✅ Loading and error states

## 🗃️ Firestore Schema

Collection: `profiles`

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Full name |
| `age` | number | Age in years |
| `gender` | string | Gender |
| `university` | string | University name |
| `budget` | number | Monthly budget in PKR |
| `preferredArea` | string | Preferred neighborhood |
| `lifestyle` | string | Quiet & Studious / Balanced / Social |
| `bio` | string | Short bio |
| `contactEmail` | string | Email address |
| `imageUrl` | string | Optional photo URL |
| `createdAt` | timestamp | Auto-generated |
| `updatedAt` | timestamp | Updated on edit |

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/seodaisies/WebAssignment03.git
cd roomsync-profiles

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## 📜 License

Submitted as coursework for The University of Lahore.