// register.js
import joi from 'joi';
import bcrypt from 'bcrypt';
import User from '../../models/User.js';
import { signToken } from '../../middlewares/jsonwebtoken.js';

const registerSchema = joi.object({
  username: joi.string()
    .required()
    .messages({
      'any.required': 'Username is required'
    }),
  email: joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'Email is required',
      'string.email': 'Email must be a valid email address'
    }),
  password: joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  myJoinComp: joi.array().items(joi.string()).default([]),
  myCreatedComp: joi.array().items(joi.string()).default([]),
});

async function register(request, response) {
  try {
    console.log('Registration request body:', request.body);
    
    // Validate request body
    const validatedData = await registerSchema.validateAsync(request.body, { abortEarly: false });
    
    console.log('Validation passed:', validatedData);
    
    // Check if user already exists by username
    const existingUserByUsername = await User.findOne({ username: validatedData.username });
    if (existingUserByUsername) {
      console.log('Duplicate username found:', validatedData.username);
      return response.status(400).json({
        error: 'DuplicateUsername',
        message: 'An account already exists with this username'
      });
    }
    
    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email: validatedData.email });
    if (existingUserByEmail) {
      console.log('Duplicate email found:', validatedData.email);
      return response.status(400).json({
        error: 'DuplicateEmail',
        message: 'An account already exists with this email address'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    // Create new user
    const newUser = new User({
      username: validatedData.username,
      email: validatedData.email,
      password: hashedPassword,
      myJoinComp: validatedData.myJoinComp,
      myCreatedComp: validatedData.myCreatedComp,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = signToken({ 
      uid: newUser._id, 
      role: newUser.role 
    });

    // Prepare response (excluding password)
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return response.status(201).json({
      message: 'Registration successful',
      data: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error details:', error);
    
    // Handle validation errors
    if (error.isJoi) {
      console.log('Joi validation error:', error.details);
      return response.status(400).json({
        error: 'ValidationError',
        message: error.details.map(detail => detail.message)
      });
    }

    // Log unexpected errors
    console.error('Unexpected registration error:', error);
    
    // Handle other errors
    return response.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred during registration',
      details: error.message
    });
  }
}

export default register;