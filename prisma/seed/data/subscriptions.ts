import { v4 as uuidv4 } from 'uuid';

export const subscriptions = [
  {
    email: 'test1@example.com',
    city: 'London',
    frequency: 'daily',
    confirmed: true,
    token: uuidv4(),
  },
  {
    email: 'test2@example.com',
    city: 'New York',
    frequency: 'hourly',
    confirmed: true,
    token: uuidv4(),
  },
  {
    email: 'test3@example.com',
    city: 'Tokyo',
    frequency: 'daily',
    confirmed: false,
    token: uuidv4(),
  },
]; 