import { Schema, model, Document } from 'mongoose';

export type RecordType = 'EMPLOYMENT' | 'EDUCATION' | 'ADDRESS' | 'IDENTITY' | 'CRIMINAL';
export type RecordStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface IRecord extends Document {
  recordId: string;
  ownerUserId: string;
  title: string;
  type: RecordType;
  status: RecordStatus;
  verifiedOn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recordSchema = new Schema<IRecord>(
  {
    recordId: { type: String, required: true, unique: true, trim: true },
    ownerUserId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['EMPLOYMENT', 'EDUCATION', 'ADDRESS', 'IDENTITY', 'CRIMINAL'],
      required: true,
    },
    status: {
      type: String,
      enum: ['VERIFIED', 'PENDING', 'REJECTED'],
      default: 'PENDING',
    },
    verifiedOn: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Record = model<IRecord>('Record', recordSchema);
