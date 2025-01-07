const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const admiModel = require('../models/adminmodel');
const userModel = require('../models/userModel.js');
const logger = require('../../config/logger');
const { generateUserToken } = require('../utils/token.helper.js');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responsehandler.js');
const giftModel = require('../models/giftsModel.js');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  logger.info(`Login attempt for email: ${email}`);
  try {
    const user = await admiModel.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: No user found with email: ${email}`);
      sendErrorResponse(res, `User not found${error.message}`);
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      logger.warn(`Login failed: Incorrect password for email: ${email}`);
      sendErrorResponse(res, `Invalid email or password ${error.message}`);
    }
    const token = generateUserToken(user);
    logger.info(`Login successful for email: ${email}`);
    sendSuccessResponse(res, 'Login successful',{ user, token } );
  } catch (error) {
    console.log(error);
    logger.error('Error updating user profile.', { error: error.message });
    sendErrorResponse(res, `Error updating user profile: ${error.message}`);
  }
};

exports.userlogin = async (req, res) => {
  const { phoneNumber, name } = req.body;
  if (!phoneNumber || !name) {
    return sendErrorResponse(res, 'Phone number and name are required', 400);
  } 
  try {
    const existingUser = await userModel.findOne({ phoneNumber});
    if(existingUser){
      if (existingUser.isSpinned===true) {
        console.log(existingUser)
        sendErrorResponse(res, 'You completed Your Chance');
        
      } else  if (existingUser.isSpinned===false){
        console.log(existingUser)
        sendSuccessResponse(res, 'User logged in successfully', existingUser);
      }
    }
    else{
      console.log(existingUser)
      const newUser = new userModel({
        phoneNumber,
        name,
        isSpinned: false  
      });
      const savedUser = await newUser.save();
      sendSuccessResponse(res, 'User created successfully', savedUser);
    }
  } catch (error) {
    console.error('Error creating or logging in user:', error);
    sendErrorResponse(res, 'Error creating or logging in user', 500, error);
  }
};

exports.createGift = async (req, res) => {
  const { userId, gifts, count } = req.body;

  if (!Array.isArray(gifts) || gifts.length === 0) {
    return sendErrorResponse(res, 'Gifts must be a non-empty array of objects', 400);
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Check for incomplete gift
    const incompleteGift = await giftModel.findOne({ userId, isCompleted: false });

    if (!incompleteGift) {
      user.isSpinned = false;
      await user.save();
    }

    // Create a new gift document
    const giftData = {
      userId,
      gifts,
      count,
      winningGifts: [], // Initialize empty, will update later
    };

    const savedGift = await giftModel.create(giftData);

    // Extract winning gifts names
    const winningGifts = gifts
      .filter((gift) => gift.isWinningGift === true)
      .map((gift) => gift.giftName);

    // Update the saved document's winningGifts field
    savedGift.winningGifts = winningGifts;
    await savedGift.save();

    // Respond with the updated gift document
    sendSuccessResponse(res, 'Gift created successfully', savedGift);

  } catch (error) {
    console.error('Error creating gift:', error);
    sendErrorResponse(res, 'Error creating gift', 500, error);
  }
};

exports.getAllGifts = async (req, res) => {
  try {
    // Fetch all gifts, ordered by timestamp
    const gifts = await giftModel.find().sort({ createdAt: -1 });

    // Process each gift to attach user details and format the response
    const giftData = await Promise.all(
      gifts.map(async (gift) => {
        // Fetch the user based on userId in each gift
        const user = await userModel.findById(gift.userId).select('phoneNumber');

        // Find all gifts with `isWinningGift: true`
        // const winningGifts = gift.gifts.filter((g) => g.isWinningGift).map((g) => g.giftName);

        return {
          userId: gift.userId,
          phoneNumber: user ? user.phoneNumber : null,
          gifts: gift.gifts,  // Array of gifts with giftName and isWinningGift
          winningGifts:gift.winningGifts,       // Array of winning gifts (can be empty if no winning gifts)
          isCompleted: gift.isCompleted,
          count: gift.count,
          createdAt: gift.createdAt,
          updatedAt: gift.updatedAt,
        };
      })
    );

    sendSuccessResponse(res, 'Gifts with user details retrieved successfully', giftData);
  } catch (error) {
    console.error('Error fetching gifts with user details:', error);
    sendErrorResponse(res, 'Error retrieving gift data', 500, error);
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await userModel.find();
    const usersWithGifts = await Promise.all(
      users.map(async (user) => {
        // Fetch the first gift that matches the conditions
        const gift = await giftModel.findOne(
          { userId: user._id, isCompleted: false }, // Only gifts where isCompleted is false
          null, // No specific fields projection
          { sort: { createdAt: 1 } } // Sort by createdAt in ascending order
        );

        // Prepare the user object with the filtered gift (if exists)
        return {
          _id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          isSpinned: user.isSpinned,
          gifts: gift
            ? {
                _id: gift._id,
                gifts: gift.gifts,
                count: gift.count,
                winningGifts: gift.gifts
                  .filter((g) => g.isWinningGift)
                  .map((g) => g.giftName), // Collect winning gift names
                createdAt: gift.createdAt,
                updatedAt: gift.updatedAt,
              }
            : null, // If no matching gift, return null
        };
      })
    );

    sendSuccessResponse(
      res,
      'Users with first created gifts retrieved successfully',
      usersWithGifts
    );
  } catch (error) {
    console.error('Error fetching users with gifts:', error);
    sendErrorResponse(res, 'Error retrieving users and gifts', 500, error);
  }
};

exports.spin = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return sendErrorResponse(res, 'Phone number is required', 400);
  }

  try {
    const user = await userModel.findOne({ phoneNumber });
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    let earliestGift = await giftModel.findOne({ userId: user._id, isCompleted: false }).sort({ createdAt: 1 });

    if (!earliestGift) {
      return sendErrorResponse(res, 'No available spin for this user', 404);
    }

    if (earliestGift.winningGifts && earliestGift.winningGifts.length > 0) {
      earliestGift.winningGifts.shift(); 
    }

    if (earliestGift.count > 1) {
      earliestGift.count -= 1;
      await earliestGift.save();
      return sendSuccessResponse(res, 'Spin successful, count decremented', {
        user,
        gift: earliestGift
      });
    }

    // Step 4: Handle the case where the gift count is 1, marking it as completed
    else if (earliestGift.count === 1) {
      earliestGift.count = 0;
      earliestGift.isCompleted = true;
      earliestGift.winningGifts = []; // Clear the winningGifts array
      await earliestGift.save();

      // Step 5: Check if there are any more incomplete gifts for the user
      const hasIncompleteGift = await giftModel.exists({ userId: user._id, isCompleted: false });

      if (!hasIncompleteGift) {
        // If no incomplete gifts, update isSpinned to true
        user.isSpinned = true;
        await user.save();
        return sendSuccessResponse(res, 'Spin successful, all gifts completed, user marked as spun', {
          user,
          gift: earliestGift
        });
      }

      return sendSuccessResponse(res, 'Spin successful, gift marked as completed', {
        user,
        gift: earliestGift
      });
    }

    // Step 6: If the gift count is 0, find a completed gift and update the spin status
    else {
      const completedGift = await giftModel.findOne({ userId: user._id, isCompleted: true });

      if (completedGift) {
        return sendSuccessResponse(res, 'All spins are completed for this user', {
          user
        });
      } else {
        return sendErrorResponse(res, 'No completed gifts found for the user', 404);
      }
    }
  } catch (error) {
    console.error('Error in spinning user:', error);
    sendErrorResponse(res, 'Error in spinning user', 500, error);
  }
};

exports.getAllGiftsbyId = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    // Step 1: Find the user by phone number
    const user = await userModel.findOne({ phoneNumber }).select('_id');
    if (!user) {
      return sendErrorResponse(res, 'User not found for the provided phone number', 404);
    }

    // Step 2: Find the latest completed gift
    const latestGift = await giftModel
      .findOne({ userId: user._id, isCompleted: false }) // Filter for completed gifts
      .sort({ createdAt: 1 }); // Sort by creation date in ascending order (latest one created last)

    if (!latestGift) {
      return sendSuccessResponse(res, 'You have completed everything.', null);
    }

    // Step 3: Prepare the response
    const giftData = {
      userId: latestGift.userId,
      phoneNumber,
      gifts: latestGift.gifts,
      winningGifts: latestGift.winningGifts,
      isCompleted: latestGift.isCompleted,
      createdAt: latestGift.createdAt,
      updatedAt: latestGift.updatedAt,
    };

    sendSuccessResponse(res, 'Latest completed gift retrieved successfully', giftData);
  } catch (error) {
    console.error('Error fetching gifts by phone number:', error);
    sendErrorResponse(res, 'Error retrieving gift data', 500, error);
  }
};










