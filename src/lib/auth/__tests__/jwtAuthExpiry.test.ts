import jwt from "jsonwebtoken";
import { JWTAuthService, UserRole } from "../jwt-auth";

describe("JWTAuthService tokenExpiry parsing and lifetime preservation", () => {
  const secret = "test-secret-that-is-at-least-32-chars-long";

  it("correctly preserves numeric seconds expiry without fallback to 3600", async () => {
    const service = new JWTAuthService({
      jwtSecret: secret,
      tokenExpiry: 60,
      refreshTokenExpiry: "7d",
      issuer: "alchm.kitchen",
    });

    const user = await service.createUser("test@alchm.kitchen", "Password123!", [UserRole.USER]);
    expect(user).not.toBeNull();

    const auth = await service.authenticate("test@alchm.kitchen", "Password123!");
    if (!auth) throw new Error("Expected auth to succeed");
    expect(auth.expiresIn).toBe(60);

    const decoded = jwt.decode(auth.accessToken);
    if (!decoded || typeof decoded === "string" || typeof decoded.exp !== "number" || typeof decoded.iat !== "number") {
      throw new Error("Invalid decoded token");
    }
    expect(decoded.exp - decoded.iat).toBe(60);
  });

  it("handles string expiry formats correctly", async () => {
    const service1h = new JWTAuthService({
      jwtSecret: secret,
      tokenExpiry: "1h",
      refreshTokenExpiry: "7d",
      issuer: "alchm.kitchen",
    });
    await service1h.createUser("test1h@alchm.kitchen", "Password123!", [UserRole.USER]);
    const auth1h = await service1h.authenticate("test1h@alchm.kitchen", "Password123!");
    if (!auth1h) throw new Error("Expected auth1h to succeed");
    expect(auth1h.expiresIn).toBe(3600);

    const service60s = new JWTAuthService({
      jwtSecret: secret,
      tokenExpiry: "60s",
      refreshTokenExpiry: "7d",
      issuer: "alchm.kitchen",
    });
    await service60s.createUser("test60s@alchm.kitchen", "Password123!", [UserRole.USER]);
    const auth60s = await service60s.authenticate("test60s@alchm.kitchen", "Password123!");
    if (!auth60s) throw new Error("Expected auth60s to succeed");
    expect(auth60s.expiresIn).toBe(60);
  });
});
