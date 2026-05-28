import { CatCareService } from "./cat-care.service";

export abstract class CareReportHandler {
  static async handleCareReport({
    catRecordId,
    catId,
  }: {
    catRecordId: string;
    catId: string;
  }) {
    await CatCareService.saveCareMessage({ catRecordId, catId });
  }
}
