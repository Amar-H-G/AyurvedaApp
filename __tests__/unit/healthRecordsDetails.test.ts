/**
 * Unit tests — Health Record Details & Attachment Modals
 */
import { healthRecordsApi } from '../../src/services/api/healthRecordsApi';

describe('Health Record Details & Attachments API', () => {
  it('fetches health record details by id', async () => {
    const recordsRes = await healthRecordsApi.getRecords(1);
    expect(recordsRes.success).toBe(true);
    if (recordsRes.success && recordsRes.data.data.length > 0) {
      const firstRecord = recordsRes.data.data[0];
      const detailRes = await healthRecordsApi.getRecordById(firstRecord.id);
      expect(detailRes.success).toBe(true);
      if (detailRes.success && detailRes.data) {
        expect(detailRes.data.id).toBe(firstRecord.id);
        expect(detailRes.data.title).toBe(firstRecord.title);
        expect(Array.isArray(detailRes.data.attachments)).toBe(true);
      }
    }
  });

  it('returns null for non-existent record id', async () => {
    const res = await healthRecordsApi.getRecordById('rec_invalid_999999');
    expect(res.success).toBe(false);
  });
});
