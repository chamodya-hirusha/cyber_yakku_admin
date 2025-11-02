# Cyber Yakku Admin Panel

A modern admin panel built with Next.js 15, MySQL, and Tailwind CSS.

## Features

- 🔐 Secure authentication with JWT
- 📊 Dashboard with analytics
- 👥 User management
- 📦 Product management
- 🎨 Media management
- ⚙️ Settings management

## Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: JWT with bcrypt
- **UI Components**: Radix UI
- **Forms**: React Hook Form with Zod validation

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database credentials and JWT secret.


5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin panel pages
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── admin/             # Admin-specific components
│   └── ui/                # UI components
├── lib/                   # Utility libraries
└── public/                # Static assets
```

## API Endpoints

- `POST /api/login` - User authentication
- `GET /api/admins` - Get all admins
- `POST /api/admins` - Create new admin
- `GET /api/categories` - Get categories
- `GET /api/users/customers` - Get customers

## Environment Variables

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=cms_db
JWT_SECRET=your-super-secret-jwt-key-here
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.