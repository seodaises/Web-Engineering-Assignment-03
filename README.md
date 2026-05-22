# RoomSync: Web Engineering Assignment 04

A role-based secure web application built with **React + Firebase**, featuring authentication, role-based protected routing, a real-time chat system, and admin/user dashboards with analytics.

> **University of Lahore — BSCS — Spring 2026 — Web Engineering**
> Submitted by: Khawla (SAP ID: 70145895)

---

## 🚀 Live Demo

🌐 **Live URL:** _[paste your Firebase Hosting URL here after deployment]_
📦 **GitHub Repo:** _[paste your GitHub repo URL here]_

---

## ✨ Features

### 🔐 Firebase Authentication
- Email & Password Sign Up / Sign In
- Google Sign-In (one-click OAuth)
- Sign Out
- Password Reset via email
- Delete Account (removes both Firestore doc and Auth account)

### 👥 User Management
- User documents stored in Firestore `users` collection on sign-up
- Default role: `user`. Admins are promoted manually (or via Admin Dashboard)
- Real-time sync, if your role changes, the UI updates instantly without re-login

### Role-Aware CRUD (Profiles)
- **Anyone** can view profiles
- **Logged-in users** can create profiles
- **Creators** can edit and delete their own profiles
- **Admins** can delete *any* profile (moderation capability)
- Admins cannot edit profiles they didn't create (clean role separation)

### Real-Time Chat System
- One-on-one chats between registered users
- Small avatar next to each message
- Auto-scroll to newest message
- **Unread message badges** on:
  - Navbar "My Chats" link (total across all chats)
  - Each chat in the chat list
  - Recent chats card on user dashboard
- Chat directly from profile cards (💬 icon) and profile detail pages
- Search users by name/email when starting a new chat

### Dashboard Analytics

**Admin Dashboard:**
- 4 live stat cards: Total Users, Admins, Regular Users, Total Profiles
- Lifestyle breakdown bar chart (pure CSS, animated)
- Recent users table with **one-click Promote/Demote** buttons

**User Dashboard:**
- 3 stat cards: My Profiles count, Total Budget Posted, Days Active
- List of my profiles with quick View/Edit links
- Recent chats preview with unread badges

---

## Tech Stack

- **React 19** + Vite
- **Tailwind CSS v4** (with Flowbite-style components, blue/indigo palette, dark mode)
- **Firebase 12**:
  - Authentication (Email/Password + Google)
  - Firestore (real-time database via `onSnapshot`)
  - Hosting (production deployment)
- **React Router DOM v7** (routing + protected routes)
