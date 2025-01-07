
const { createAccessToken, createRefreshToken, getAccessTokenExpiry, getRefreshTokenExpiry } = require("./jwt.service");

const generateUserToken = (user) => {
    // Generate the payload
    const payload = {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        type: 'USER'
    };

    // Generate tokens
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // Create the tokens object with expiry times
    const tokens = {
        accessToken,
        refreshToken,
        accessExpiryTime: getAccessTokenExpiry(),
        refreshExpiryTime: getRefreshTokenExpiry()
    };

    return tokens;
};

module.exports = {
    generateUserToken
};
