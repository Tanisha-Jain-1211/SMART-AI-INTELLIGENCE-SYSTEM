// Implements authentication flows with JWT access/refresh tokens.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../utils/prismaClient");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

/**
 * Registers a new citizen user and returns access and refresh tokens.
 */
async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        password: hashedPassword,
        role: "CITIZEN",
        phone: body.phone || null
      }
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash }
    });

    return res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Authenticates a user and issues new access and refresh tokens.
 */
async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isValidPassword = await bcrypt.compare(body.password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshTokenHash }
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Verifies a refresh token and returns a newly issued access token.
 */
async function refresh(req, res, next) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, refreshToken: true }
    });

    if (!user?.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    const accessToken = signAccessToken(user);
    return res.status(200).json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Logs out the current user by clearing stored refresh token hash.
 */
async function logout(req, res, next) {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null }
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns the currently authenticated user profile.
 */
async function me(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, refresh, logout, me };
