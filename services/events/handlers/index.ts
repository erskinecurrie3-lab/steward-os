/**
 * Event bus handlers — wire up integrations and automation
 */

import { eventBus } from "../event-bus";
import { handleVisitorCreated } from "./visitor-created";

let registered = false;

export function registerEventHandlers(): void {
  if (registered) return;
  registered = true;
  eventBus.subscribe("visitor_created", handleVisitorCreated);
  eventBus.subscribe("person.updated", handleVisitorCreated);
}
