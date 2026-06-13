import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  division: string;
  message: string;
  status: string;
  timestamp: string;
}

export interface Blog {
  id: string;
  title_en: string;
  title_hi: string;
  title_mr: string;
  content_en: string;
  content_hi: string;
  content_mr: string;
  author: string;
  slug: string;
  date: string;
}

export interface SEOConfig {
  home_title: string;
  home_description: string;
  hotel_title: string;
  hotel_description: string;
  sand_title: string;
  sand_description: string;
  materials_title: string;
  materials_description: string;
  keywords: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'admin' | 'client' | 'dealer';
  timestamp: string;
}

export interface DatabaseSchema {
  leads: Lead[];
  blogs: Blog[];
  seo: SEOConfig;
  users: User[];
}

export function readDb(): DatabaseSchema {
  try {
    const defaultUsers: User[] = [
      {
        id: 'user-admin',
        name: 'Bhaiyya Patil',
        email: 'admin@jayshreeram.com',
        phone: '+91 99751 75762',
        password: 'admin123',
        role: 'admin',
        timestamp: new Date().toISOString()
      },
      {
        id: 'user-client-1',
        name: 'Rahul Client',
        email: 'client@example.com',
        phone: '+91 98765 43210',
        password: 'client123',
        role: 'client',
        timestamp: new Date().toISOString()
      },
      {
        id: 'user-dealer-1',
        name: 'Suresh Dealer',
        email: 'dealer@example.com',
        phone: '+91 91234 56789',
        password: 'dealer123',
        role: 'dealer',
        timestamp: new Date().toISOString()
      }
    ];

    if (!fs.existsSync(dbPath)) {
      const defaultDb: DatabaseSchema = {
        leads: [],
        blogs: [],
        users: defaultUsers,
        seo: {
          home_title: 'Elite Enterprise',
          home_description: 'Elite corporate group',
          hotel_title: 'Hotel',
          hotel_description: 'Pure veg restaurant',
          sand_title: 'Sand Supply',
          sand_description: 'Logistics solutions',
          materials_title: 'Building Materials',
          materials_description: 'Cement steel supplier',
          keywords: 'business, transport, restaurant'
        }
      };
      // Ensure directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const raw = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(raw);
    if (!db.users || db.users.some((u: any) => u.role === 'customer')) {
      db.users = defaultUsers;
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (error) {
    console.error('Error reading JSON DB:', error);
    return {
      leads: [],
      blogs: [],
      users: [],
      seo: {
        home_title: 'Elite Enterprise',
        home_description: 'Elite corporate group',
        hotel_title: 'Hotel',
        hotel_description: 'Pure veg restaurant',
        sand_title: 'Sand Supply',
        sand_description: 'Logistics solutions',
        materials_title: 'Building Materials',
        materials_description: 'Cement steel supplier',
        keywords: 'business, transport, restaurant'
      }
    };
  }
}

export function writeDb(data: DatabaseSchema): boolean {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing JSON DB:', error);
    return false;
  }
}
