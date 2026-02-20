# backend/alchm_kitchen/auth_middleware.py
import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.jwk import PyJWKClient

# This is the JWKS endpoint for your Privy application
PRIVY_JWKS_URL = f"https://auth.privy.io/api/v1/apps/{os.environ.get('PRIVY_APP_ID')}/jwks.json"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to verify a Privy JWT and return the decoded claims.
    Raises an HTTPException if the token is invalid.
    """
    try:
        jwks_client = PyJWKClient(PRIVY_JWKS_URL)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=os.environ.get('PRIVY_APP_ID'),
            issuer="privy.io",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {e}",
        )

# Example of a model you might use for the user claims
# from pydantic import BaseModel
# class PrivyUser(BaseModel):
#     sub: str  # The user's Privy DID
#     # ... other fields from the token payload
