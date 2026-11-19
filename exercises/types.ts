export type Actor = { id: string; role: string };
export type Ticket = { id: string; title: string; status: string; version: number; createdAt: string; description?: string; ownerId?: string; assigneeId?: string | null; archived?: boolean; priority?: string };
