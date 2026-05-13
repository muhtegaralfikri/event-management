import { EventCategory } from "@/generated/prisma/enums";

export const eventCategoryLabels: Record<EventCategory, string> = {
  TECHNOLOGY: "Technology",
  BUSINESS: "Business",
  DESIGN: "Design",
  COMMUNITY: "Community",
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  NETWORKING: "Networking",
  OTHER: "Other",
};

export const formatEventCategory = (category: EventCategory) => eventCategoryLabels[category];
