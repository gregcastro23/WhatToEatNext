# Onboarding Portal

## Overview

The WhatToEatNext onboarding portal allows users to create personalized profiles with their birth data, which is then used to calculate their natal chart and provide personalized culinary recommendations based on alchemical and astrological principles.

## Features

### 1. **User-Friendly Location Input**
- **Location Search**: Users can search for their birth location by city name instead of entering latitude/longitude coordinates
- **Geocoding Service**: Uses OpenStreetMap's Nominatim API for free geocoding (no API key required)
- **Autocomplete**: Shows up to 5 location suggestions as users type
- **Validation**: Ensures location is selected before submission

### 2. **Smart Defaults**
- **Current Moment**: Birth date/time defaults to the current moment, but can be adjusted
- **Timezone Detection**: Automatically detects user's timezone

### 3. **Natal Chart Calculation**
- **Planetary Positions**: Calculates positions of all 10 planets at birth time/location
- **Alchemical Properties**: Derives Spirit, Essence, Matter, Substance (ESMS) from planetary positions
- **Elemental Balance**: Calculates Fire, Water, Earth, Air affinities
- **Dominant Element**: Determines user's primary elemental affinity

### 4. **Admin Account Setup**
- **Pre-configured Admin**: xalchm@gmail.com is pre-configured as the admin account
- **Role-Based Access**: Admin users have full system access

## Architecture

### Services

#### `geocodingService.ts`
Handles location search and geocoding:
- `geocodeLocation(locationName)`: Search for locations by name
- `geocodeLocationSingle(locationName)`: Get best match for a location
- `reverseGeocode(lat, lon)`: Convert coordinates to location name

#### `userDatabaseService.ts`
Manages user profiles and data:
- In-memory storage (can be upgraded to PostgreSQL)
- User CRUD operations
- Profile management with birth data and natal charts
- Onboarding status tracking

### API Routes

#### `GET /api/geocoding?q=location`
Search for locations by name. Returns up to 5 results with:
- Display name
- Latitude/longitude
- Type (city, town, etc.)
- Country

#### `POST /api/onboarding`
Complete user onboarding. Requires:
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "birthData": {
    "dateTime": "2025-01-01T12:00:00Z",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York"
  }
}
```

Returns:
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name"
  },
  "natalChart": {
    "dominantElement": "Fire",
    "planetaryPositions": { ... },
    "alchemicalProperties": { ... }
  }
}
```

#### `GET /api/user/profile?email=user@example.com`
Get user profile by email or userId

#### `PUT /api/user/profile`
Update user profile

### UI Components

#### `LocationSearch.tsx`
Reusable location search component with autocomplete:
- Debounced search (500ms)
- Click-outside detection
- Loading states
- Selected location indicator

#### `page.tsx` (Onboarding Page)
Main onboarding form with:
- Email input
- Name input
- Birth date/time picker (defaults to current moment)
- Location search
- Form validation
- Loading states
- Error handling
- Success redirect to profile page

## User Flow

1. **User visits** `/onboarding` (via "Get Started" button in navigation)
2. **Enters information**:
   - Email address
   - Full name
   - Birth date/time (defaults to current moment)
   - Birth location (search by city name)
3. **Submits form**
4. **System calculates**:
   - Planetary positions at birth time/location
   - Alchemical properties from planetary positions
   - Elemental balance and dominant element
   - Creates natal chart
5. **Profile created** and user redirected to profile page
6. **Personalized recommendations** now available based on natal chart

## Admin Setup

The admin account (xalchm@gmail.com) is pre-initialized in the user database with:
- **Roles**: admin, user
- **Status**: Active
- **Birth Data**: Set during onboarding

To set up the admin account:
1. Visit `/onboarding`
2. Enter: xalchm@gmail.com
3. Complete the onboarding form
4. Admin account will be updated with birth data and natal chart

## Integration with Existing System

### UserContext Integration
The onboarding system integrates seamlessly with the existing `UserContext`:
- User profile is stored in localStorage after onboarding
- UserContext loads profile on app initialization
- Profile includes birth data and natal chart for recommendations

### Authentication Integration
Currently uses email-based identification. Can be upgraded to integrate with JWT authentication system in `jwt-auth.ts`.

## Technical Details

### Geocoding
- **Provider**: OpenStreetMap Nominatim API
- **Rate Limits**: Fair use policy (max 1 request/second)
- **No API Key**: Free to use
- **User-Agent**: Required (set to "WhatToEatNext/1.0")

### Natal Chart Calculation
Uses existing `astrologizeApi` service:
- Calculates planetary positions for specific date/time/location
- Converts to zodiac signs (tropical system)
- Derives alchemical properties via `calculateAlchemicalFromPlanets()`

### Data Storage
Currently in-memory via `userDatabaseService`:
- Map-based storage (userId → UserWithProfile)
- Email index for quick lookup
- Can be upgraded to PostgreSQL without changing API

## Future Enhancements

1. **Password Authentication**: Add bcrypt password hashing
2. **Email Verification**: Send verification emails
3. **Social Login**: OAuth integration (Google, Facebook)
4. **Database Upgrade**: PostgreSQL with Prisma ORM
5. **Profile Photos**: Avatar upload and storage
6. **Onboarding Progress**: Multi-step wizard with progress tracking
7. **Birth Time Uncertainty**: Handle unknown birth times
8. **Location History**: Save frequently used locations
9. **Data Export**: Allow users to download their data
10. **Account Deletion**: GDPR-compliant data removal

## Testing

### Manual Testing Steps
1. Visit http://localhost:3000/onboarding
2. Enter test email: test@example.com
3. Enter name: Test User
4. Adjust birth date/time if needed
5. Search for location: "New York"
6. Select first result
7. Submit form
8. Verify redirect to profile page
9. Check natal chart data is displayed

### Admin Testing
1. Visit http://localhost:3000/onboarding
2. Enter: xalchm@gmail.com
3. Enter name: Admin User
4. Complete onboarding
5. Verify admin role in profile
6. Test admin-only features

## Files Created/Modified

### New Files
- `src/services/geocodingService.ts` - Location geocoding service
- `src/services/userDatabaseService.ts` - User database service
- `src/app/api/geocoding/route.ts` - Geocoding API endpoint
- `src/app/api/onboarding/route.ts` - Onboarding API endpoint
- `src/app/api/user/profile/route.ts` - User profile API endpoint
- `src/components/onboarding/LocationSearch.tsx` - Location search component
- `src/app/onboarding/page.tsx` - Onboarding page

### Modified Files
- `src/app/layout.tsx` - Added "Get Started" navigation link

## Dependencies

All features use existing dependencies. No new packages required.

## Environment Variables

No additional environment variables needed. Uses existing:
- `JWT_SECRET` - For future authentication integration

## Support

For issues or questions:
- Check console for error messages
- Verify geocoding API is accessible
- Check network requests in browser DevTools
- Ensure astrologize API is running

---

**Created**: November 19, 2025
**Version**: 1.0.0
