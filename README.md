# ComplainX - Municipal Grievance Redressal & Civic Issue Tracking System

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)

**ComplainX** is a modern, full-featured municipal grievance redressal and public civic monitoring platform designed for citizens and municipal corporations (MCD / Nagar Nigam / Municipal Councils). It connects everyday citizens directly with municipal engineers and zonal officers for swift, transparent resolution of civic issues.

---

## 🌟 Key Features

### 1. Citizen Grievance Portal
- **Instant Complaint Filing**: Submit complaints with category selection (Water Supply, Sanitation / Waste, Electricity, Roads & Potholes, Street Lights, etc.).
- **Real-Time Tracking**: Track any grievance using its unique Tracking ID (e.g., `#CMP1001`) with timeline stages (Submitted → Under Review → Assigned to Officer → Resolved).
- **Citizen Ledger**: View all complaints filed by your mobile number or email in one unified list.
- **Priority & Location Tagging**: Specify ward numbers, landmark addresses, and issue urgency.

### 2. Official Municipal Staff Dashboard (`Office Dashboard`)
- **Executive KPI Analytics**: High-level metrics for total complaints, pending inspections, active in-progress works, verified resolutions, and resolution rate (%).
- **Public Information Dossier**: Full citizen information displayed for every grievance:
  - Complainant Citizen Name & Contact Details
  - Direct 1-Click Phone Dialer (`tel:`) & Email Dispatch (`mailto:`)
  - Locality / Ward jurisdiction & issue breakdown
- **Action Taken Report (ATR) Workflow**: Update complaint status (`Pending` → `In Progress` → `Resolved`), assign designated officers, and record official resolution remarks.
- **Citizen Directory**: Aggregated citizen records with complaint histories and direct outreach tools.
- **Export & Print**: Export complaints to CSV for official municipal registers or generate print-friendly work orders.

### 3. Real-Time Firebase Sync & Zero-Downtime Resilience
- **Google Firebase Firestore**: Real-time snapshot synchronization across all active devices.
- **Offline & First-Load Fallbacks**: Pre-seeded demo dataset ensures the app runs smoothly with zero blank-screen failures, even before network initialization.
- **Built-in Error Boundary**: Gracefully catches any unexpected runtime issues with one-click reload and cache reset utilities.

### 4. Master Developer Console
- Secure administrative portal to generate official staff accounts with custom Staff IDs, designation, department, and secure 4-digit PINs.
- Real-time Firestore database stats and manual seed management.

---

## 🔑 Demo Access & Login Credentials

You can test all user roles immediately using the following pre-configured credentials:

### A. Municipal Official Login (Officer / Authority)
1. Click **"Official Login"** in the top navigation bar.
2. Enter either of the following credentials:
   - **Option 1 (Zonal Officer)**:
     - **Official Staff ID / Govt Email**: `OFF-7721` *(or `vikram.mcd@gov.in`)*
     - **Security PIN**: `7721`
     - *Profile: Er. Vikram Malhotra, Zonal Chief Grievance Officer*
   - **Option 2 (Senior Superintendent)**:
     - **Official Staff ID / Govt Email**: `alsheikhrehan922@gmail.com` *(or `OFF-101`)*
     - **Security PIN**: `8969`
     - *Profile: Sheikh Rehan, Senior Municipal Superintendent*

### B. Citizen Login
1. Click **"Citizen Login"** in the navigation bar.
2. Enter your name, mobile number, and email to sign in or create your citizen account.

### C. Master Developer Console
1. Click **"Dev Console"** in the top bar or footer.
2. Enter developer credentials:
   - **Email**: `alsheikhrehan922@gmail.com`
   - **Master Password**: `8969288@ab`
3. Generate new Official IDs and PINs, inspect live complaints, or verify Firebase connectivity.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (version 18.0 or higher recommended)
- npm or yarn

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/complainx.git
   cd complainx
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will boot at `http://localhost:3000` (or the port specified by Vite).

4. **Build for Production**:
   ```bash
   npm run build
   ```
   Compiled static assets will be output to the `dist/` directory, ready for deployment.

5. **Preview the Production Build**:
   ```bash
   npm run preview
   ```

---

## 🌐 Deploying to GitHub Pages (Automated via GitHub Actions)

This project is configured with `base: '/ComplainX/'` in `vite.config.ts` specifically for:
**`https://al-sheikh-rehan.github.io/ComplainX/`**

### Step-by-Step GitHub Pages Setup:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```
2. **Enable GitHub Pages via Actions**:
   - Go to your repository on GitHub: `https://github.com/al-sheikh-rehan/ComplainX`
   - Click on **Settings** tab (gear icon at the top).
   - In the left sidebar, click on **Pages**.
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. **Automatic Deployment**:
   - The included workflow in `.github/workflows/deploy.yml` will automatically build and publish the site.
   - You can monitor progress under the **Actions** tab of your repository.
   - Once completed, your portal will be live at:
     **https://al-sheikh-rehan.github.io/ComplainX/**

### Vercel / Netlify
1. Connect your GitHub repository.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Deploy!

---

## 🛠️ Project Structure

```
complainx/
├── index.html                   # HTML5 entry point
├── package.json                 # Dependencies & scripts
├── vite.config.ts               # Vite configuration with relative asset paths
├── tsconfig.json                # TypeScript configuration
├── metadata.json                # App metadata and permissions
├── src/
│   ├── main.tsx                 # React DOM mount wrapped with ErrorBoundary
│   ├── App.tsx                  # Main router and global application state
│   ├── index.css                # Tailwind CSS v4 setup
│   ├── types.ts                 # TypeScript interfaces and domain models
│   ├── components/
│   │   ├── ErrorBoundary.tsx    # App-level crash prevention and recovery UI
│   │   ├── Navbar.tsx           # Responsive header with role badges
│   │   ├── Footer.tsx           # System footer and quick navigation
│   │   ├── HomeView.tsx         # Landing page with stats, filters & quick actions
│   │   ├── SubmitComplaintView.tsx # Citizen complaint submission form
│   │   ├── TrackComplaintView.tsx  # Timeline tracking for complaint IDs
│   │   ├── MyComplaintsView.tsx # Public & personal complaint records
│   │   ├── OfficialDashboardView.tsx # Municipal official dashboard & citizen dossier
│   │   ├── AuthModal.tsx        # Citizen and Official authentication dialog
│   │   ├── DeveloperConsoleModal.tsx # Master dev console for generating PINs
│   │   ├── DashboardStats.tsx   # Interactive metric counter cards
│   │   ├── ComplaintBadges.tsx  # Visual status, priority & category badges
│   │   └── AboutView.tsx        # Portal background, SLAs & civic guides
│   ├── lib/
│   │   └── firebase.ts          # Firebase SDK initialization & Firestore handlers
│   └── utils/
│       └── storage.ts           # Storage utilities & initial mock data
```

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
