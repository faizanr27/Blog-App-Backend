"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors = require('cors');
const dotenv_1 = __importDefault(require("dotenv"));
// import postRoutes from './routes/post.Routes';
const auth_Routes_1 = __importDefault(require("./routes/auth.Routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const protected_Routes_1 = __importDefault(require("./routes/protected.Routes"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const db_1 = __importDefault(require("./db/db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middleware
const corsOptions = {
    origin: ['https://dev-blogg.vercel.app/', 'http://localhost:5173'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
};
app.use(cors(corsOptions));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
;
// Routes
app.use('/', protected_Routes_1.default);
// app.use('/api', postRoutes);
app.use('/api/auth', auth_Routes_1.default);
// Database Connection
(0, db_1.default)();
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
