import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User, IUser } from '../models/User';
import { Record, RecordType, RecordStatus } from '../models/Record';

// ────────────────────────── helpers ──────────────────────────
const SALT_ROUNDS = 10;

async function hash(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// ────────────────────────── user data ────────────────────────
interface SeedUser {
  userId: string;
  name: string;
  email: string;
  plainPassword: string;
  role: 'ADMIN' | 'GENERAL_USER';
  status: 'ACTIVE' | 'INACTIVE';
}

const seedUsers: SeedUser[] = [
  {
    userId: 'admin001',
    name: 'Admin User',
    email: 'admin@mploychek.com',
    plainPassword: 'Admin@123',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  {
    userId: 'user001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    plainPassword: 'User@123',
    role: 'GENERAL_USER',
    status: 'ACTIVE',
  },
  {
    userId: 'user002',
    name: 'Bob Williams',
    email: 'bob@example.com',
    plainPassword: 'User@123',
    role: 'GENERAL_USER',
    status: 'ACTIVE',
  },
  {
    userId: 'user003',
    name: 'Carol Davis',
    email: 'carol@example.com',
    plainPassword: 'User@123',
    role: 'GENERAL_USER',
    status: 'ACTIVE',
  },
  {
    userId: 'user004',
    name: 'Dave Martinez',
    email: 'dave@example.com',
    plainPassword: 'User@123',
    role: 'GENERAL_USER',
    status: 'ACTIVE',
  },
  {
    userId: 'user005',
    name: 'Eve Thompson',
    email: 'eve@example.com',
    plainPassword: 'User@123',
    role: 'GENERAL_USER',
    status: 'INACTIVE',
  },
];

// ────────────────────────── record data ──────────────────────
interface SeedRecord {
  recordId: string;
  ownerUserId: string;
  title: string;
  type: RecordType;
  status: RecordStatus;
  verifiedOn: Date | null;
}

const types: RecordType[] = ['EMPLOYMENT', 'EDUCATION', 'ADDRESS', 'IDENTITY', 'CRIMINAL'];
const statuses: RecordStatus[] = ['VERIFIED', 'PENDING', 'REJECTED'];

function buildRecords(ownerUserId: string, startIndex: number, count: number): SeedRecord[] {
  const records: SeedRecord[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startIndex + i;
    const type = types[i % types.length];
    const status = statuses[i % statuses.length];
    records.push({
      recordId: `REC${String(idx).padStart(3, '0')}`,
      ownerUserId,
      title: `${type.charAt(0) + type.slice(1).toLowerCase()} Check`,
      type,
      status,
      verifiedOn: status === 'VERIFIED' ? new Date('2026-09-15') : null,
    });
  }
  return records;
}

const seedRecords: SeedRecord[] = [
  // 5 records per general user (user001 – user005)
  ...buildRecords('user001', 1, 5),
  ...buildRecords('user002', 6, 5),
  ...buildRecords('user003', 11, 5),
  ...buildRecords('user004', 16, 5),
  ...buildRecords('user005', 21, 5),
  // 3 records for admin
  ...buildRecords('admin001', 26, 3),
];

// ────────────────────────── seed runner ──────────────────────
async function seed(): Promise<void> {
  await connectDB();
  console.log('\n🌱  Seeding database…\n');

  // Clear collections
  await User.deleteMany({});
  await Record.deleteMany({});
  console.log('   Cleared existing Users and Records.');

  // Insert users
  const userDocs: Partial<IUser>[] = await Promise.all(
    seedUsers.map(async (u) => ({
      userId: u.userId,
      name: u.name,
      email: u.email,
      passwordHash: await hash(u.plainPassword),
      role: u.role,
      status: u.status,
    }))
  );
  await User.insertMany(userDocs);
  console.log(`   Inserted ${userDocs.length} users.`);

  // Insert records
  await Record.insertMany(seedRecords);
  console.log(`   Inserted ${seedRecords.length} records.\n`);

  // Print credentials
  console.log('─'.repeat(52));
  console.log('  Seeded Credentials');
  console.log('─'.repeat(52));
  console.log(
    `  ${'Role'.padEnd(14)} ${'User ID'.padEnd(10)} ${'Email'.padEnd(24)} Password`
  );
  console.log('─'.repeat(52));
  for (const u of seedUsers) {
    console.log(
      `  ${u.role.padEnd(14)} ${u.userId.padEnd(10)} ${u.email.padEnd(24)} ${u.plainPassword}`
    );
  }
  console.log('─'.repeat(52));
  console.log('\n✅  Seeding complete.\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
