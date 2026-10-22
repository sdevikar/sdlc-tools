import { define } from "@opencode-ai/plugin/v2/promise";

export default define({
  id: "kanban",
  setup: async (ctx) => {
    await ctx.skill.transform(async (draft) => {
      draft.source({ name: "kanban", path: new URL("../../.opencode/skills/kanban/SKILL.md", import.meta.url).pathname });
    });
    await ctx.command.transform(async (draft) => {
      // commands are provided via .opencode/commands/*.md
    });
  },
});
