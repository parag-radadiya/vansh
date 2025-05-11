# Vansh API

A comprehensive Node.js backend application ready for deployment on Vercel.

## Description

This project provides a RESTful API with various endpoints for managing user data, blogs, services, loan applications, careers, and more. It's built with Express.js and MongoDB, featuring comprehensive authentication, error handling, and documentation.

## Features

- User authentication and authorization
- Content management
- Blog management
- Career applications
- Loan applications 
- Contact form
- Services management
- FAQ management
- Testimonial management
- Success stories
- Expert profiles
- Terms and conditions management
- Address management
- Plan management
- File uploads with Cloudinary

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account (for file uploads)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the required environment variables
4. Start the development server:
   ```
   npm run dev
   ```

### Available Scripts

- `npm start` - Start the application
- `npm run start:pm2` - Start with PM2 process manager
- `npm run dev` - Start in development mode with hot reload
- `npm run docs` - Generate API documentation using JSDoc
- `npm run lint` - Run linting checks
- `npm run lint:fix` - Fix linting issues
- `npm run test` - Run tests with Jest
- `npm run build` - Build for production
- `npm run generate:postman` - Generate Postman collection

## API Documentation

Once the server is running, API documentation is available at `/api-docs`.

## Project Structure

The project follows a modular structure:
- `api/controllers/` - Request handlers
- `api/models/` - MongoDB schema definitions
- `api/routes/` - API endpoints
- `api/services/` - Business logic layer
- `api/middleware/` - Express middleware functions
- `api/utils/` - Utility functions and helpers
- `api/config/` - Configuration files

## License

This project is licensed under the MIT License.