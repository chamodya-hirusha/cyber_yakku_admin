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

3. **Set up MySQL database**:
   Create a database named `cms_db` and run the following SQL to create required tables:

   ```sql
   CREATE TABLE IF NOT EXISTS admin_users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     role VARCHAR(50) DEFAULT 'ADMIN',
     permissions JSON NULL,
     is_active TINYINT(1) DEFAULT 1,
     last_login DATETIME NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS user_sessions (
     id INT AUTO_INCREMENT PRIMARY KEY,
     user_id INT NOT NULL,
     token TEXT NOT NULL,
     expires_at DATETIME NOT NULL,
     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     INDEX (token(255)),
     FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
   );
   ```

4. **Create an admin user**:
   ```sql
   INSERT INTO admin_users (name, email, password, role, permissions, is_active)
   VALUES ('Admin', 'admin@cyberyakku.com', '$2a$10$YourBcryptHashHere', 'ADMIN', JSON_ARRAY(), 1);
   ```

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