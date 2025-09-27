# 🏗️ Construction Task Tracker

A collaborative task tracking app built for a group of 4 property supervisors managing multiple construction sites. This app ensures tasks are assigned, documented, and tracked efficiently — reducing miscommunication and improving productivity on-site.

---

## 📱 Overview

Construction Task Tracker is designed to streamline task assignment and progress tracking on construction sites. Supervisors often face difficulties remembering assigned tasks or passing updates between visits. This app helps supervisors:

- Assign tasks with photos and notes
- Organize them per site, floor, and flat
- Share visibility across all supervisors
- Track task progress and mark completion

---

## 👤 User Roles

- **4 Supervisors**, each with a unique login
- Equal permissions: assign, view, and complete tasks

---

## 🧭 User Flow & Features

### 1. 🔐 Landing Page (Login)
- Secure login for each supervisor using unique credentials
- Simple UI to authenticate and access dashboard

### 2. 🏠 Dashboard (Post-Login)
- View list of all active construction sites
- Actions:
  - ➕ Add new site
  - ✏️ Edit existing site
  - ❌ Delete site

### 3. 🏢 Site Details Page
- Define number of **floors**
- Optionally define number of **flats per floor**
- Visually organized layout of floors and flats for navigation

### 4. 📝 Task Assignment
- Navigate to specific **floor/flat**
- Assign a task by:
  - 📸 Clicking or uploading a photo
  - 🧾 Adding a short task note (e.g., "Fix wiring in Bedroom 2")
- Task is saved and visible to all supervisors

### 5. 📋 Task Visibility (Task Board)
- View all tasks assigned to a specific site/floor
- Each task includes:
  - Image thumbnail
  - Task note
  - Assigned by: [Supervisor Name]
  - Timestamp

### 6. ✅ Mark Task as Done
- Any supervisor can mark a task as complete
- Once done:
  - Task is removed from the active view
  - Logged in the database with:
    - Marked as done by: [Supervisor Name]
    - Completion date & time

---

## 🛠️ Tech Stack (Suggested)

| Layer         | Technology                 |
|---------------|-----------------------------|
| Frontend      | React Native / Flutter      |
| Backend       | Node.js / Express           |
| Authentication| Firebase Auth / JWT         |
| Database      | Firebase Firestore / MongoDB|
| Image Storage | Firebase Storage / AWS S3   |
| Hosting       | Firebase Hosting / Heroku   |

---


