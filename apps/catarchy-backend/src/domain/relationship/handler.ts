import { RelationshipService } from "./service";

export abstract class RelationshipHandler {
  static async match({ catId }: { catId: string }) {
    await RelationshipService.match({ catId });
  }
}
