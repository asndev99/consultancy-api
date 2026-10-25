import { prisma } from "../../prisma.client.js";

export async function CreateHelpAndFeedback(payload) {
  return prisma.helpAndFeedback.create({
    data: payload,
    select: {
      id: true,
      subject: true,
      description: true,
      category: true,
      priorityLevel: true,
      businessId: true,
      userId: true,
      createdAt: true,
    },
  });
}
