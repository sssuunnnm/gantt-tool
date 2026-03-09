export const LAYOUT = {
  TOOLBAR_HEIGHT: 56,
  HEADER_HEIGHT: 64,
  ROW_HEIGHT: 36,
  TREE_WIDTH: 320,
  INDENT_SIZE: 16,
} as const;

export const TIMELINE = {
  DAY_WIDTH_DEFAULT: 40,
  ZOOM_LEVELS: [24, 40, 64] as const,
  DEFAULT_RANGE_DAYS: 90,
} as const;

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
} as const;

export const WORKSPACE_ROLE = {
  OWNER: "owner",
  MEMBER: "member",
} as const;
