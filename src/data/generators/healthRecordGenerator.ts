/**
 * Deterministic health record generator — 10,000 records.
 */
import { HealthRecord, RecordType, Attachment } from '../../types';
import { RECORD_TYPES, AYURVEDIC_TAGS } from '../../constants';

const DOCTOR_NAMES = [
  'Dr. Arjun Sharma', 'Dr. Priya Patel', 'Dr. Vikram Reddy', 'Dr. Meera Nair',
  'Dr. Rajesh Kumar', 'Dr. Ananya Iyer', 'Dr. Suresh Pillai', 'Dr. Kavya Menon',
];

const HOSPITALS = [
  'Ayurvedic Wellness Clinic', 'Holistic Health Center', 'Nature Cure Hospital',
  'Panchakarma Institute', 'Vaidyashala Ayurved', 'Prakriti Wellness',
];

const LAB_TESTS = ['Complete Blood Count', 'Lipid Profile', 'Thyroid Panel', 'Liver Function', 'Kidney Function', 'Blood Glucose', 'Vitamin D', 'HbA1c'];
const VACCINES = ['Hepatitis B', 'Influenza', 'MMR', 'Tetanus', 'COVID-19', 'Typhoid', 'Varicella'];
const ALLERGENS = ['Dairy', 'Gluten', 'Shellfish', 'Pollen', 'Dust', 'Nickel', 'Latex', 'Penicillin'];
const PRESCRIPTIONS = ['Ashwagandha Capsules 500mg', 'Triphala Churna', 'Brahmi Ghee', 'Guduchi Tablets', 'Punarnava Kwath'];

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function pickN<T>(arr: readonly T[], index: number, count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const item = arr[(index * 5 + i * 13) % arr.length];
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

function generateDate(index: number): string {
  // Spread records over the last 3 years
  const now = new Date();
  const daysBack = (index * 109) % (3 * 365);
  const date = new Date(now);
  date.setDate(now.getDate() - daysBack);
  return date.toISOString().split('T')[0];
}

function generateTitle(type: RecordType, index: number): string {
  switch (type) {
    case 'lab_report': return `${pick(LAB_TESTS, index)} Report`;
    case 'prescription': return `Prescription — ${pick(PRESCRIPTIONS, index)}`;
    case 'consultation': return `Consultation with ${pick(DOCTOR_NAMES, index)}`;
    case 'vaccination': return `${pick(VACCINES, index)} Vaccination`;
    case 'allergy': return `${pick(ALLERGENS, index)} Allergy Record`;
  }
}

function generateAttachments(index: number): Attachment[] {
  const count = index % 4; // 0–3 attachments
  const attachments: Attachment[] = [];
  for (let i = 0; i < count; i++) {
    const isPdf = (index + i) % 2 === 0;
    const attachId = `att_${index}_${i}`;
    attachments.push({
      id: attachId,
      type: isPdf ? 'pdf' : 'image',
      url: isPdf
        ? `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`
        : `https://picsum.photos/seed/${attachId}/400/600`,
      fileName: isPdf ? `report_${index}_${i}.pdf` : `image_${index}_${i}.jpg`,
      thumbnailUrl: isPdf
        ? undefined
        : `https://picsum.photos/seed/${attachId}/100/100`,
    });
  }
  return attachments;
}

export function generateHealthRecord(index: number): HealthRecord {
  const id = `rec_${String(index + 1).padStart(6, '0')}`;
  const type = pick(RECORD_TYPES, index) as RecordType;
  const date = generateDate(index);

  return {
    id,
    type,
    title: generateTitle(type, index),
    date,
    doctorName: ['lab_report', 'prescription', 'consultation'].includes(type)
      ? pick(DOCTOR_NAMES, index)
      : undefined,
    hospitalName: pick(HOSPITALS, index),
    description: `Recorded on ${date}. ${type === 'lab_report' ? 'Results reviewed and within acceptable range.' : 'Follow-up recommended in 30 days.'}`,
    tags: pickN(AYURVEDIC_TAGS as unknown as readonly string[], index, 2),
    attachments: generateAttachments(index),
    createdAt: new Date(date).toISOString(),
  };
}

let _cachedRecords: HealthRecord[] | null = null;

export function generateHealthRecords(count: number = 10000): HealthRecord[] {
  if (_cachedRecords && _cachedRecords.length === count) {
    return _cachedRecords;
  }
  const records: HealthRecord[] = [];
  for (let i = 0; i < count; i++) {
    records.push(generateHealthRecord(i));
  }
  _cachedRecords = records;
  return records;
}
