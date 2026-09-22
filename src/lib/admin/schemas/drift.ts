/**
 * Compile-time drift guard between a server payload type and the client
 * schema that validates it.
 *
 *   type _Check = AssertTrue<ServerSatisfies<ServerType, z.infer<typeof Schema>>>;
 *
 * fails `tsc` the moment the server stops producing something the schema
 * requires (a renamed, removed, or retyped field). Type-only: nothing here
 * exists at runtime.
 *
 * @file src/lib/admin/schemas/drift.ts
 */

export type ServerSatisfies<Server, Schema> = [Server] extends [Schema] ? true : false;

export type AssertTrue<T extends true> = T;
