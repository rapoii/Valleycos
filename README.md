<div align="center">
  <img src="https://images.unsplash.com/photo-1592312674332-9ea3543eb35a?q=80&w=2070&auto=format&fit=crop" alt="SocPlay Banner" width="100%" style="object-fit: cover; height: 300px; border-radius: 12px;" />
  
  <h1 style="font-size: 3rem; margin-top: 20px;">🎮 SocPlay</h1>
  
  <p style="font-size: 1.2rem; margin-bottom: 20px;">
    The Ultimate Retro-Styled Social Platform for Cosplayers.
  </p>

  <div>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </div>
</div>

<br />

## ✨ About The Project

**SocPlay** (Valleycos_) is a vibrant community platform designed for cosplay enthusiasts to share their work, connect with others, and discover amazing costumes. 

Built with a unique **Pixel Art / Retro aesthetic**, the application combines modern performance with nostalgic design. It features real-time interactions, a gallery system for cosplay sets, and a global chat to keep the community connected.

## 🚀 Key Features

- **🎨 Retro Pixel UI**: A fully custom-styled interface featuring pixel-perfect components and smooth `framer-motion` animations.
- **📸 Interactive Gallery**: Browse high-quality cosplay sets, view details, and engage with content.
- **💬 Global Chat**: Real-time messaging system allowing users to chat with everyone online.
- **👤 User Profiles**: personalized profiles showcasing avatars, saved photos, and user details.
- **🔐 Secure Authentication**: Robust login and registration system powered by Supabase Auth.
- **🛡️ Admin Dashboard**: Built-in moderation tools to manage users and content safely.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Custom Pixel Components
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)

## 📦 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/rapoii/Website-Cosplay.git
    cd Website-Cosplay
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```
    > *Note: You will need to set up the corresponding tables in your Supabase project using the SQL files in the `supabase/` folder.*

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 🗄️ Database Setup (Supabase)

This project includes SQL migration files to set up your database schema automatically.
1.  Go to your Supabase Project -> SQL Editor.
2.  Run the contents of `supabase/schema.sql` to create tables and security policies.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Made with ❤️ by PixelHeart</p>
</div>
