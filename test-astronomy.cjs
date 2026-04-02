const Astronomy = require('astronomy-engine');

try {
    const date = new Date();
    const astroTime = new Astronomy.AstroTime(date);
    const body = Astronomy.Body.Sun;
    
    console.log("Testing Astronomy.Ecliptic(Astronomy.Body.Sun, astroTime)...");
    const ecl = Astronomy.Ecliptic(body, astroTime);
    console.log("Sun Ecliptic:", ecl);
    
    // For the Sun, ecliptic longitude should be its geocentric longitude?
    // Actually Astronomy.Ecliptic(body, time) for a planet returns heliocentric coordinates.
    // For the Sun, it might be different or not supported.
    
    const mars = Astronomy.Body.Mars;
    console.log("Testing Astronomy.Ecliptic(Astronomy.Body.Mars, astroTime)...");
    const marsEcl = Astronomy.Ecliptic(mars, astroTime);
    console.log("Mars Ecliptic (Heliocentric?):", marsEcl);

    // Usually for astrology we want Geocentric coordinates.
    // Let's see if EclipticLongitude is geocentric or heliocentric.
    console.log("Testing Astronomy.EclipticLongitude(Astronomy.Body.Mars, astroTime)...");
    const marsLong = Astronomy.EclipticLongitude(mars, astroTime);
    console.log("Mars Ecliptic Longitude:", marsLong);

} catch (e) {
    console.log("Error:", e.message);
}
