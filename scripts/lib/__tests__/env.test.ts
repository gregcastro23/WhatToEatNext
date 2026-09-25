import { parseEnvFileText } from "../env";

describe("parseEnvFileText", () => {
  it("reads assignments and strips surrounding quotes", () => {
    expect(
      parseEnvFileText('DATABASE_URL="postgres://a/b"\nOTHER=\'x\'\nPLAIN=value'),
    ).toEqual({ DATABASE_URL: "postgres://a/b", OTHER: "x", PLAIN: "value" });
  });

  it("keeps an empty value as the empty string", () => {
    expect(parseEnvFileText("EMPTY=\nALSO_EMPTY=  ")).toEqual({ EMPTY: "", ALSO_EMPTY: "" });
  });

  it("ignores comments, blank lines and lowercase keys", () => {
    expect(parseEnvFileText("# COMMENT=1\n\nlower=1\nKEY=1")).toEqual({ KEY: "1" });
  });
});
