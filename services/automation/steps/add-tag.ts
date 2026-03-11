/**
 * add_tag step — Add tag/label to guest (e.g. journey_stage, status)
 * StewardOS uses journeyStage, status on Guest. "Tag" maps to these fields.
 */

import { prisma } from "@/lib/db";

export type AddTagInput = {
  guestId: string;
  tag: string;
  tagType?: "journey_stage" | "status" | "custom";
};

export async function executeAddTag(input: AddTagInput): Promise<{ success: boolean }> {
  const updateData: Record<string, string> = {};
  switch (input.tagType) {
    case "journey_stage":
      updateData.journeyStage = input.tag;
      break;
    case "status":
      updateData.status = input.tag;
      break;
    default:
      updateData.journeyStage = input.tag;
  }

  await prisma.guest.update({
    where: { id: input.guestId },
    data: updateData,
  });
  return { success: true };
}
