/**
 * avatarStorage — R2 avatar persistence (clone of cookPhotoStorage) plus the
 * own-prefix delete guard. Fixture identity: Marie Curie (historical roster).
 */

const sendMock = jest.fn();

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(() => ({ send: sendMock })),
  PutObjectCommand: jest.fn((input) => ({ __type: "put", input })),
  DeleteObjectCommand: jest.fn((input) => ({ __type: "delete", input })),
}));

const CURIE = "11111111-1111-1111-1111-111111111111"; // Marie Curie
const TESLA = "22222222-2222-2222-2222-222222222222"; // Nikola Tesla

// 1x1 transparent PNG.
const PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

type AvatarStorage = typeof import("@/lib/profile/avatarStorage");

async function loadConfigured(): Promise<AvatarStorage> {
  process.env.CLOUDFLARE_ACCOUNT_ID = "test-account";
  process.env.R2_ACCESS_KEY_ID = "test-key";
  process.env.R2_SECRET_ACCESS_KEY = "test-secret";
  process.env.NEXT_PUBLIC_R2_DOMAIN = "https://assets.alchm.kitchen";
  let mod: AvatarStorage;
  await jest.isolateModulesAsync(async () => {
    mod = await import("@/lib/profile/avatarStorage");
  });
  return mod!;
}

describe("storeAvatar", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({});
  });

  it("stores a valid PNG under the caller's avatars/<userId>/ prefix", async () => {
    const storage = await loadConfigured();
    const url = await storage.storeAvatar(CURIE, `data:image/png;base64,${PNG_B64}`);
    expect(url).toMatch(
      new RegExp(`^https://assets\\.alchm\\.kitchen/avatars/${CURIE}/[0-9a-f]{24}\\.png$`),
    );
    expect(sendMock).toHaveBeenCalledTimes(1);
    const cmd = sendMock.mock.calls[0][0];
    expect(cmd.__type).toBe("put");
    expect(cmd.input.Key).toMatch(new RegExp(`^avatars/${CURIE}/`));
    expect(cmd.input.ContentType).toBe("image/png");
  });

  it("rejects non-image mimes without touching R2", async () => {
    const storage = await loadConfigured();
    const url = await storage.storeAvatar(CURIE, `data:image/svg+xml;base64,${PNG_B64}`);
    expect(url).toBeNull();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects malformed data URLs", async () => {
    const storage = await loadConfigured();
    expect(await storage.storeAvatar(CURIE, "https://evil.example/pic.png")).toBeNull();
    expect(await storage.storeAvatar(CURIE, "data:image/png;base64,not$$base64")).toBeNull();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects payloads over 5MB", async () => {
    const storage = await loadConfigured();
    const big = Buffer.alloc(5 * 1024 * 1024 + 1, 7).toString("base64");
    const url = await storage.storeAvatar(CURIE, `data:image/jpeg;base64,${big}`);
    expect(url).toBeNull();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns null (never throws) when the R2 put fails", async () => {
    const storage = await loadConfigured();
    sendMock.mockRejectedValueOnce(new Error("r2 down"));
    const url = await storage.storeAvatar(CURIE, `data:image/png;base64,${PNG_B64}`);
    expect(url).toBeNull();
  });
});

describe("deleteAvatarObject — own-prefix guard", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({});
  });

  it("deletes an object under the caller's own prefix", async () => {
    const storage = await loadConfigured();
    const ok = await storage.deleteAvatarObject(
      CURIE,
      `https://assets.alchm.kitchen/avatars/${CURIE}/abc123.png`,
    );
    expect(ok).toBe(true);
    const cmd = sendMock.mock.calls[0][0];
    expect(cmd.__type).toBe("delete");
    expect(cmd.input.Key).toBe(`avatars/${CURIE}/abc123.png`);
  });

  it("REFUSES another user's avatar URL (Curie cannot delete Tesla's visage)", async () => {
    const storage = await loadConfigured();
    const ok = await storage.deleteAvatarObject(
      CURIE,
      `https://assets.alchm.kitchen/avatars/${TESLA}/abc123.png`,
    );
    expect(ok).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("refuses non-avatar prefixes and foreign domains", async () => {
    const storage = await loadConfigured();
    expect(
      await storage.deleteAvatarObject(
        CURIE,
        `https://assets.alchm.kitchen/cook-photos/${CURIE}/dish.jpg`,
      ),
    ).toBe(false);
    expect(
      await storage.deleteAvatarObject(CURIE, `https://evil.example/avatars/${CURIE}/x.png`),
    ).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("refuses traversal past the prefix", async () => {
    const storage = await loadConfigured();
    const ok = await storage.deleteAvatarObject(
      CURIE,
      `https://assets.alchm.kitchen/avatars/${CURIE}/../${TESLA}/x.png`,
    );
    expect(ok).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("swallows R2 delete failures (best-effort)", async () => {
    const storage = await loadConfigured();
    sendMock.mockRejectedValueOnce(new Error("r2 down"));
    const ok = await storage.deleteAvatarObject(
      CURIE,
      `https://assets.alchm.kitchen/avatars/${CURIE}/abc123.png`,
    );
    expect(ok).toBe(false);
  });
});
