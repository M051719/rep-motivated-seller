import { pgTable, serial, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  address: text('address').notNull(),
  price: text('price'),
  isMotivated: boolean('is_motivated').default(false),
  userId: serial('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  propertyAddress: text('property_address').notNull(),
  ownerName: text('owner_name'),
  phoneNumber: varchar('phone_number', { length: 15 }),
  email: text('email'),
  propertyValue: text('property_value'),
  motivationLevel: text('motivation_level'),
  createdAt: timestamp('created_at').defaultNow(),
});