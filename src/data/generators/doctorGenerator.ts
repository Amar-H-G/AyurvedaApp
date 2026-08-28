/**
 * Deterministic doctor data generator.
 * Produces exactly N doctors with stable IDs and realistic fields.
 * Deterministic: same seed → same data (uses index-based generation).
 */
import { Doctor, DoctorSpecialty } from '../../types';
import { SPECIALTIES, LANGUAGES } from '../../constants';

const FIRST_NAMES = [
  'Arjun', 'Priya', 'Vikram', 'Ananya', 'Rajesh', 'Kavya', 'Suresh', 'Meera',
  'Aditya', 'Lakshmi', 'Mohan', 'Divya', 'Ravi', 'Sunita', 'Kiran', 'Pooja',
  'Sanjay', 'Nita', 'Gopal', 'Radha', 'Venkat', 'Saritha', 'Balaji', 'Usha',
  'Ashok', 'Geeta', 'Naresh', 'Rekha', 'Vinod', 'Smita',
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Iyer',
  'Pillai', 'Menon', 'Rao', 'Joshi', 'Verma', 'Saxena', 'Mishra', 'Tiwari',
  'Chauhan', 'Agarwal', 'Bhat', 'Shetty',
];

const CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Coimbatore', 'Mysore', 'Nagpur',
];

const QUALIFICATIONS = [
  'BAMS', 'BAMS, MD (Ayurveda)', 'BAMS, PhD', 'MD (Ayurveda)',
  'BAMS, MS (Shalya)', 'BAMS, MD (Panchakarma)',
];

const BIOS = [
  'Experienced practitioner specialising in traditional Ayurvedic healing with a holistic approach.',
  'Dedicated to combining ancient Ayurvedic wisdom with modern medical understanding.',
  'Passionate about natural healing and patient education in Ayurvedic principles.',
  'Expert in personalised treatment plans based on individual Prakriti analysis.',
  'Committed to evidence-based Ayurvedic practice with focus on chronic disease management.',
];

const TAG_POOL = [
  'Vata', 'Pitta', 'Kapha', 'Panchakarma', 'Detox', 'Chronic Pain',
  'Skin', 'Digestion', 'Immunity', 'Weight', 'Stress', 'Fertility',
];

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function pickN<T>(arr: readonly T[], index: number, count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const item = arr[(index + i * 7) % arr.length];
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

/**
 * Generate a single doctor deterministically.
 */
export function generateDoctor(index: number): Doctor {
  const id = `doc_${String(index + 1).padStart(5, '0')}`;
  const firstName = pick(FIRST_NAMES, index * 3);
  const lastName = pick(LAST_NAMES, index * 7);
  const specialty = pick(SPECIALTIES, index) as DoctorSpecialty;
  const experience = 2 + (index % 28); // 2–29 years
  const rating = Number((3.5 + ((index * 37) % 15) / 10).toFixed(1)); // 3.5–5.0
  const reviewCount = 20 + (index * 13) % 480;
  const fee = 300 + (index % 40) * 50; // 300–2250
  const availableToday = index % 3 !== 0;
  const languageCount = 1 + (index % 3);

  return {
    id,
    name: `Dr. ${firstName} ${lastName}`,
    specialty,
    qualification: pick(QUALIFICATIONS, index),
    experience,
    rating,
    reviewCount,
    consultationFee: fee,
    languages: pickN(LANGUAGES as unknown as readonly string[], index, languageCount),
    imageUrl: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
    location: pick(CITIES, index),
    availableToday,
    bio: pick(BIOS, index),
    tags: pickN(TAG_POOL, index, 3),
  };
}

/**
 * Generate N doctors.
 * Lazy: returns an array with stable references.
 */
let _cachedDoctors: Doctor[] | null = null;

export function generateDoctors(count: number = 5000): Doctor[] {
  if (_cachedDoctors && _cachedDoctors.length === count) {
    return _cachedDoctors;
  }
  const doctors: Doctor[] = [];
  for (let i = 0; i < count; i++) {
    doctors.push(generateDoctor(i));
  }
  _cachedDoctors = doctors;
  return doctors;
}

/**
 * Generate time slots for a doctor.
 */
import { TimeSlot } from '../../types';

const SLOT_TIMES = [
  ['08:00', '08:30'], ['08:30', '09:00'], ['09:00', '09:30'], ['09:30', '10:00'],
  ['10:00', '10:30'], ['10:30', '11:00'], ['11:00', '11:30'], ['14:00', '14:30'],
  ['14:30', '15:00'], ['15:00', '15:30'], ['15:30', '16:00'], ['16:00', '16:30'],
  ['17:00', '17:30'], ['17:30', '18:00'],
];

export function generateSlotsForDoctor(doctorId: string, daysAhead: number = 7): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();

  for (let d = 0; d < daysAhead; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    const doctorIndex = parseInt(doctorId.replace('doc_', ''), 10);
    const slotCount = 4 + (doctorIndex % 6); // 4–9 slots per day

    for (let s = 0; s < slotCount; s++) {
      const timeIndex = (doctorIndex * 3 + s * 2) % SLOT_TIMES.length;
      const [startTime, endTime] = SLOT_TIMES[timeIndex];
      const slotId = `slot_${doctorId}_${dateStr}_${s}`;

      // Mark some slots as booked for realism
      const isBooked = (doctorIndex + d + s) % 4 === 0;

      // Past slots are expired
      const slotDateTime = new Date(`${dateStr}T${startTime}:00`);
      const isExpired = slotDateTime < new Date();

      slots.push({
        id: slotId,
        doctorId,
        date: dateStr,
        startTime,
        endTime,
        isBooked,
        isExpired,
      });
    }
  }

  return slots;
}
