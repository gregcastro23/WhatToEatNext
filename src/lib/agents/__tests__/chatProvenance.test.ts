import { planetaryAgentsGateway } from "../planetaryAgentsGateway";

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

it.each([
  [{}, false, undefined],
  [{ ai_generated: false, agentId: "leonardo-da-vinci" }, false, "leonardo-da-vinci"],
  [{ ai_generated: "true", agentId: 7 }, false, undefined],
  [{ ai_generated: true, agentId: "leonardo-da-vinci" }, true, "leonardo-da-vinci"],
])("preserves provider inference and actor evidence from %j", async (fields, expectedInference, expectedActor) => {
  global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ text: "A real response from the mocked provider.", ...fields })));
  const result = await planetaryAgentsGateway.chatWithAgent({ agentId: "leonardo-da-vinci", userMessage: "Adapt this recipe" });
  expect(result.metadata.aiGenerated).toBe(expectedInference);
  expect(result.providerAgentId).toBe(expectedActor);
});
