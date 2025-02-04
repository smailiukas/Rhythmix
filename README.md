# Rhythmix Music Player
### Disclaimer: the project is unfinished and some things may not work properly
A modern web-based music player application built with React and Node.js.


## Setup
### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to  URL_ADDRESS:5173 to view the application.
### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

4. The server will run on  URL_ADDRESS:5000.

music-app/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── styles/      # CSS modules
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # Helper functions
│   ├── public/          # Static files
│   └── .env             # Frontend environment variables
├── server/              # Backend Node.js application
│   ├── controllers/     # Request handlers
│   ├── models/         # Database schemas
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Helper functions
│   ├── uploads/        # Music file storage
│   └── .env            # Backend environment variables
└── README.md


## Features

- 🎵 Music playback with play, pause, skip controls
- 🔀 Shuffle and repeat modes
- 🎚️ Volume control and progress bar
- 📱 Responsive design
- ⚡ Fast and modern UI
- 🎨 Clean, minimalist interface

## Tech Stack

### Frontend
- React (Vite)
- Modern JavaScript
- CSS3 with CSS Modules

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- File system management

## API Endpoints

### Songs
- `GET /api/songs` - Fetch all songs
- `POST /api/upload` - Upload new song