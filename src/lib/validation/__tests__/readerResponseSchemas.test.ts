/**
 * Round-trips for the reader schemas that replaced opaque `z.custom<T>()`
 * casts (Phase 42). Each fixture is typed as the SERVER type, sent through
 * JSON the way NextResponse.json sends it, and must parse — including the
 * sparse shapes (absent optionals, null previews) a real account produces.
 */
import { ChatInboxResponseSchema } from "../chatResponseSchemas";
import {
  FeedCommentListResponseSchema,
  FeedCommentPostResponseSchema,
} from "../feedResponseSchemas";
import { MealPlanAddResponseSchema, MealPlanListResponseSchema } from "../mealPlanResponseSchemas";
import { TableCommentListResponseSchema } from "../tableResponseSchemas";
import type {
  FeedComment,
  FeedCommentListResponse,
  FeedCommentPostResponse,
} from "@/services/feedCommentsDatabaseService";
import type { ChatInboxResponse } from "@/types/chat";
import type { TableCommentListResponse } from "@/types/table";
import type { MealPlanAddResponse, MealPlanListResponse } from "@/types/userMealPlan";

const wire = (value: unknown): unknown => JSON.parse(JSON.stringify(value));
const at = "2026-09-25T12:00:00.000Z";

describe("ChatInboxResponseSchema", () => {
  it("parses a sparse inbox: untitled circle with no messages, nameless DM partner", () => {
    const body: ChatInboxResponse = {
      success: true,
      viewerId: "u-1",
      conversations: [
        {
          conversation: { id: "c-1", kind: "circle", lastMessageAt: null, archivedAt: null, createdAt: at, updatedAt: at },
          membership: { role: "member", notifyLevel: "all", lastReadAt: null },
          lastMessage: null,
          unreadCount: 0,
        },
        {
          conversation: { id: "c-2", kind: "dm", title: "ignored", lastMessageAt: at, archivedAt: null, createdAt: at, updatedAt: at },
          membership: { role: "member", notifyLevel: "all", lastReadAt: at },
          lastMessage: { id: "m-1", senderId: "u-2", body: "hi", createdAt: at },
          unreadCount: 3,
          otherUser: { id: "u-2", isAgent: false },
        },
      ],
    };

    const parsed = ChatInboxResponseSchema.parse(wire(body));

    expect(parsed.conversations).toHaveLength(2);
    expect(parsed.conversations[0]?.lastMessage).toBeNull();
    expect(parsed.conversations[1]?.otherUser?.name).toBeUndefined();
  });
});

describe("feed comment schemas", () => {
  const comment: FeedComment = {
    id: "fc-1",
    eventId: "e-1",
    authorId: "u-1",
    authorName: "Anonymous Alchemist",
    authorImage: null,
    authorIsAgent: false,
    authorElement: null,
    body: "lovely",
    createdAt: at,
    isEventActor: false,
  };

  it("parses a page, including the last page's null cursor", () => {
    const body: FeedCommentListResponse = { success: true, comments: [comment], nextCursor: null };
    expect(FeedCommentListResponseSchema.parse(wire(body)).comments[0]).toEqual(comment);
  });

  it("parses a post with and without a reward", () => {
    const withReward: FeedCommentPostResponse = {
      success: true,
      comment,
      reward: { tokenType: "Essence", amount: 1, hint: "first comment" },
    };
    const without: FeedCommentPostResponse = { success: true, comment, reward: null };
    expect(FeedCommentPostResponseSchema.parse(wire(withReward)).reward?.amount).toBe(1);
    expect(FeedCommentPostResponseSchema.parse(wire(without)).reward).toBeNull();
  });

  it("rejects a failure body rather than reading it as a comment", () => {
    expect(FeedCommentPostResponseSchema.safeParse({ success: false, message: "Event not found" }).success).toBe(false);
  });
});

describe("TableCommentListResponseSchema", () => {
  it("keeps a nameless author's key absent", () => {
    const body: TableCommentListResponse = {
      success: true,
      comments: [{ id: "tc-1", tableId: "t-1", authorId: "u-1", body: "we ate well", createdAt: at }],
    };
    const [parsed] = TableCommentListResponseSchema.parse(wire(body)).comments;
    expect(parsed && "authorName" in parsed).toBe(false);
  });
});

describe("meal-plan schemas", () => {
  it("parses the signed-out empty list", () => {
    const body: MealPlanListResponse = { authenticated: false, entries: [] };
    expect(MealPlanListResponseSchema.parse(wire(body))).toEqual(body);
  });

  it("parses an entry whose recipe name and meal type were never set", () => {
    const body: MealPlanAddResponse = {
      authenticated: true,
      entry: { id: "mp-1", recipeId: "r-1", date: "2026-09-25", servings: 1, addedAt: 1_758_800_000_000 },
    };
    const { entry } = MealPlanAddResponseSchema.parse(wire(body));
    expect("recipeName" in entry).toBe(false);
    expect("mealType" in entry).toBe(false);
  });
});
