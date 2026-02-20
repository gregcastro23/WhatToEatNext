import {Request, Response, NextFunction} from 'express';
import * as jwt from 'jsonwebtoken';
import {JwksClient} from 'jwks-rsa';

// Initialize the JWKS client
const client = new JwksClient({
  // This is the JWKS endpoint for your Privy application
  jwksUri: 'https://auth.privy.io/api/v1/apps/cmluie0y802fa0cl88n1a4chh/jwks.json',
});

// Extend the Express Request type to include the Privy user payload
interface RequestWithUser extends Request {
  user?: jwt.JwtPayload | string;
}

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  if (!header.kid) {
    return callback(new Error('No KID found in token header'));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export const authenticateUser = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({message: 'Authentication token not found or is not a Bearer token.'});
  }

  const token = authHeader.substring(7, authHeader.length); // "Bearer " is 7 characters

  // Verify the token using the public key from the JWKS endpoint
  jwt.verify(token, getKey, {algorithms: ['RS256']}, (err, decoded) => {
    if (err) {
      return res.status(401).json({message: 'Invalid authentication token.', error: err.message});
    }

    if (!decoded) {
      return res.status(401).json({message: 'Could not decode token.'});
    }

    // You can now access the user's Privy ID and other claims on the request object
    req.user = decoded;
    console.log('Successfully authenticated user with privyId:', (decoded as jwt.JwtPayload).sub);

    next();
  });
};
