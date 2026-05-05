# School Chat 💬

A random one-on-one chat application for students, similar to Omegle but with smart matching based on course and college.

## Features

- **Anonymous chat** - No registration required, just enter a nickname
- **Smart matching** - Matched with students from the same college or similar courses
- **Real-time messaging** - Instant chat with typing indicators
- **Course/College preferences** - Prioritizes matches within your academic circle
- **Clean, modern UI** - Simple and intuitive interface

## Tech Stack

- **Frontend:** React, Socket.io-client
- **Backend:** Node.js, Express, Socket.io
- **Styling:** Custom CSS with modern design

## Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies (in a new terminal)
cd client
npm install
```

### 2. Start the Server

```bash
cd server
npm start
```

The server will run on `http://localhost:5000`

### 3. Start the Client

```bash
cd client
npm start
```

The client will run on `http://localhost:3000`

## How It Works

### Matching Algorithm

The app uses a scoring system to find the best chat partner:

1. **Same College** (+100 points) - Highest priority
2. **Same Course** (+50 points) - High priority
3. **Similar Field** (+25 points) - e.g., both Engineering, both IT

If no perfect match is found, users are placed in a waiting pool until someone suitable joins.

### Available Courses & Colleges

**Colleges:**
- College of Information Technology (CIT)
- College of Engineering (COE)
- College of Business Administration (CBA)
- College of Nursing (CON)
- College of Education (COED)
- College of Arts and Sciences (CAS)

**Courses:**
- BSIT, BSCS (IT field)
- BSCE, BSEE, BSME (Engineering field)
- BSBA, BSA (Business field)
- BSN (Nursing)
- BSED, BEED (Education)
- BSPsych, BSPolSci (Arts)
- BSBio, BSChem, BSMath (Sciences)

## Folder Structure

```
school-chat/
├── server/
│   ├── index.js          # Socket.io server & matching logic
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.js        # Main app component
│   │   ├── components/
│   │   │   ├── LoginScreen.js
│   │   │   ├── ChatScreen.js
│   │   │   └── WaitingScreen.js
│   │   └── index.css     # Styles
│   └── package.json
└── README.md
```

## Customization

You can easily customize the app by:

1. **Adding more courses/colleges** - Edit the dropdowns in `client/src/components/LoginScreen.js`
2. **Adjusting matching priority** - Modify the scoring in `server/index.js` (`calculateMatchScore` function)
3. **Changing the design** - Edit `client/src/index.css`

## Deployment

For production deployment:

1. Update `SERVER_URL` in `client/src/App.js` to point to your server
2. Build the client: `cd client && npm run build`
3. Deploy the server and the built client to your hosting platform

## License

MIT
