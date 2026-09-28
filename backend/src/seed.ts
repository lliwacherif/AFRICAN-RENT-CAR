import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

// ── Schemas (inline for seed script) ─────────────────────────────────────────

const ParcSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  city: String,
  capacity: { type: Number, default: 50 },
  description: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: String,
  age: { type: Number, default: 25 },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  avatar: String,
  isEmailVerified: { type: Boolean, default: true },
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  modelName: String,
  year: { type: Number, required: true },
  plate: { type: String, unique: true, required: true },
  color: String,
  category: { type: String, required: true },
  transmission: { type: String, required: true },
  fuel: { type: String, required: true },
  seats: { type: Number, required: true },
  doors: { type: Number, default: 5 },
  bags: { type: Number, required: true },
  engineSize: String,
  fuelTankCapacity: Number,
  mileage: Number,
  pricePerDay: { type: Number, required: true },
  pricePerWeek: Number,
  pricePerMonth: Number,
  depositAmount: { type: Number, default: 500 },
  minDriverAge: { type: Number, default: 21 },
  parc: { type: mongoose.Schema.Types.ObjectId, ref: 'Parc' },
  images: [String],
  model3dUrl: String,
  features: {
    ac: { type: Boolean, default: false },
    bluetooth: { type: Boolean, default: false },
    radio: { type: Boolean, default: false },
    usb: { type: Boolean, default: false },
    gps: { type: Boolean, default: false },
    cruiseControl: { type: Boolean, default: false },
    parkingSensors: { type: Boolean, default: false },
    camera360: { type: Boolean, default: false },
    sunroof: { type: Boolean, default: false },
    heatedSeats: { type: Boolean, default: false },
  },
  status: { type: String, default: 'Disponible' },
  isActive: { type: Boolean, default: true },
  lastMaintenanceDate: Date,
  maintenanceNotes: String,
  nextMaintenanceDate: Date,
  acquisitionDate: Date,
  acquisitionCost: Number,
  description: String,
  tags: [String],
}, { timestamps: true });

const ReservationSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  pickupDate: { type: Date, required: true },
  dropoffDate: { type: Date, required: true },
  driverAge: { type: Number, required: true },
  totalDays: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  subtotalHT: { type: Number, required: true },
  tva: { type: Number, required: true },
  totalTTC: { type: Number, required: true },
  depositAmount: { type: Number, required: true },
  paymentOption: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  remainingBalance: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'pending' },
  paymentMethod: String,
  paymentReference: String,
  status: { type: String, default: 'recu' },
  acceptAlternative: { type: Boolean, default: true },
  options: [String],
  notes: String,
  internalNotes: String,
  confirmedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  completedAt: Date,
  mileageAtPickup: Number,
  mileageAtDropoff: Number,
}, { timestamps: true });

const HoldSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupDate: { type: Date, required: true },
  dropoffDate: { type: Date, required: true },
  expiresAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Parc = mongoose.model('Parc', ParcSchema);
const User = mongoose.model('User', UserSchema);
const Vehicle = mongoose.model('Vehicle', VehicleSchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);
const Hold = mongoose.model('Hold', HoldSchema);

const ApartmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, default: 'Appartement' },
  city: { type: String, required: true },
  address: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  cleaningFee: { type: Number, default: 0 },
  depositAmount: { type: Number, default: 200 },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  bedsCount: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  surfaceM2: Number,
  minNights: { type: Number, default: 1 },
  amenities: {
    wifi: { type: Boolean, default: true },
    ac: { type: Boolean, default: true },
    pool: { type: Boolean, default: false },
    seaView: { type: Boolean, default: false },
    parking: { type: Boolean, default: true },
    kitchen: { type: Boolean, default: true },
    tv: { type: Boolean, default: true },
    washingMachine: { type: Boolean, default: false },
    terrace: { type: Boolean, default: false },
    heating: { type: Boolean, default: true },
    elevator: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
  },
  images: [String],
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  unavailableDates: [Date],
}, { timestamps: true });

const ApartmentReservationSchema = new mongoose.Schema({
  apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalNights: { type: Number, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, default: 0 },
  pricePerNight: { type: Number, required: true },
  subtotalHT: { type: Number, required: true },
  tva: { type: Number, required: true },
  cleaningFee: { type: Number, default: 0 },
  totalTTC: { type: Number, required: true },
  depositAmount: { type: Number, default: 200 },
  status: { type: String, default: 'recu' },
  paymentStatus: { type: String, default: 'pending' },
  specialRequests: String,
  cancelReason: String,
}, { timestamps: true });

const ExcursionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: { type: String, default: 'Sahara & Désert' },
  departureCity: { type: String, required: true },
  destination: { type: String, required: true },
  duration: { type: String, required: true },
  pricePerAdult: { type: Number, required: true },
  pricePerChild: { type: Number, default: 0 },
  maxGroupSize: { type: Number, default: 15 },
  minGroupSize: { type: Number, default: 2 },
  included: [String],
  excluded: [String],
  itinerary: [{
    dayOrTime: String,
    title: String,
    description: String,
  }],
  images: [String],
  availableDays: [String],
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const ExcursionReservationSchema = new mongoose.Schema({
  excursion: { type: mongoose.Schema.Types.ObjectId, ref: 'Excursion', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, default: 0 },
  totalParticipants: { type: Number, required: true },
  pricePerAdult: { type: Number, required: true },
  pricePerChild: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  pickupLocation: String,
  status: { type: String, default: 'recu' },
  paymentStatus: { type: String, default: 'pending' },
  specialRequests: String,
  cancelReason: String,
}, { timestamps: true });

const Apartment = mongoose.model('Apartment', ApartmentSchema);
const ApartmentReservation = mongoose.model('ApartmentReservation', ApartmentReservationSchema);
const Excursion = mongoose.model('Excursion', ExcursionSchema);
const ExcursionReservation = mongoose.model('ExcursionReservation', ExcursionReservationSchema);

// Helper for dates
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ── Main Seed Script ─────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/tunisia-car-rental';
  console.log(`\n🌱 Connecting to MongoDB: ${uri}`);
  await mongoose.connect(uri);
  console.log('✅ Connected successfully!\n');

  // Clear collections
  await Parc.deleteMany({});
  await Vehicle.deleteMany({});
  await Reservation.deleteMany({});
  await Hold.deleteMany({});
  await Apartment.deleteMany({});
  await ApartmentReservation.deleteMany({});
  await Excursion.deleteMany({});
  await ExcursionReservation.deleteMany({});

  // 2. Check / Create Users (ALL PASSWORDS ARE '12345678')
  let createdUsers: any[] = await User.find({}).lean();
  const defaultPassword = await bcrypt.hash('12345678', 12);
  const usersData: any[] = [
    { firstName: 'Ahmed', lastName: 'Guezguez', email: 'admin@tunisiacarrental.com', role: 'admin', phone: '+216 70 123 456', age: 30, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
    { firstName: 'Sonia', lastName: 'Mansour', email: 'manager@tunisiacarrental.com', role: 'admin', phone: '+216 71 888 999', age: 35, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200' },
    { firstName: 'Ahmed', lastName: 'Guezguez', email: 'ahmed@example.com', role: 'customer', phone: '+216 98 765 432', age: 28, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    { firstName: 'Fatima', lastName: 'Ben Saïd', email: 'fatima@example.com', role: 'customer', phone: '+216 92 345 678', age: 32, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    { firstName: 'Karim', lastName: 'Al-Mansouri', email: 'karim@example.com', role: 'customer', phone: '+216 95 456 789', age: 45, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
    { firstName: 'Nadia', lastName: 'Boucher', email: 'nadia@example.com', role: 'customer', phone: '+216 99 567 890', age: 26, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
    { firstName: 'Youssef', lastName: 'Trabelsi', email: 'youssef@example.com', role: 'customer', phone: '+216 22 111 222', age: 30, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
    { firstName: 'Sarah', lastName: 'Ben Ammar', email: 'sarah@example.com', role: 'customer', phone: '+216 55 444 333', age: 24, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
    { firstName: 'Admin', lastName: 'African Rent Car', email: 'admin@africanrentcar.com', role: 'admin', phone: '+216 70 123 456', age: 30, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
  ];

  if (createdUsers.length === 0) {
    console.log('👤 No existing users found. Seeding default users...');
    for (const u of usersData) {
      const user = await User.create({ ...u, password: defaultPassword, isEmailVerified: true });
      createdUsers.push(user);
      console.log(`👤 Created user: ${u.email} (${u.role}) — Password: 12345678`);
    }
  } else {
    console.log(`👤 Reusing ${createdUsers.length} existing users.`);
    for (const u of usersData.filter((entry) => entry.role === 'admin' && entry.email === 'admin@africanrentcar.com')) {
      const existing = createdUsers.find((user: any) => user.email === u.email);
      if (!existing) {
        const user = await User.create({ ...u, password: defaultPassword, isEmailVerified: true });
        createdUsers.push(user);
        console.log(`👤 Created user: ${u.email} (${u.role}) — Password: 12345678`);
      }
    }
  }

  console.log('');

  // 1. Create Parcs (Agences / Branches)
  const parcsData = [
    { name: 'Parc Aéroport Tunis-Carthage', city: 'Tunis', address: 'Aéroport Tunis-Carthage, Terminal Arrivées', capacity: 60, description: 'Agence principale ouverte 24/7' },
    { name: 'Parc Sousse - Port El Kantaoui', city: 'Sousse', address: 'Zone Touristique Port El Kantaoui', capacity: 40, description: 'Agence de la Côte Sahélienne' },
    { name: 'Parc Hammamet Nord', city: 'Hammamet', address: 'Avenue Koweït, Hammamet', capacity: 35, description: 'Agence balnéaire Cap Bon' },
    { name: 'Parc Djerba-Zarzis', city: 'Djerba', address: 'Aéroport Djerba-Zarzis', capacity: 30, description: 'Agence du Sud Tunisien' },
  ];

  const createdParcs: any[] = [];
  for (const p of parcsData) {
    const parc = await Parc.create(p);
    createdParcs.push(parc);
    console.log(`🏢 Created Parc: ${parc.name} (${parc.city})`);
  }

  console.log('');

  // Users are preserved — skip creation


  // 3. Create Vehicles with Legitimate Specs and High-Res Images
  const vehiclesData: any[] = [
    {
      name: 'Fiat Panda', brand: 'Fiat', modelName: 'Panda Lounge', year: 2022, category: 'Économique', transmission: 'Manuelle',
      fuel: 'Essence', seats: 5, doors: 4, bags: 2, pricePerDay: 20, pricePerWeek: 130, pricePerMonth: 500, color: 'Rouge',
      plate: '215-TU-7890', images: [
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: false, cruiseControl: false, parkingSensors: false, camera360: false, sunroof: false, heatedSeats: false },
      status: 'Disponible', isActive: true, parc: createdParcs[0]._id,
      description: 'Petite citadine ultra économique et maniable, idéale pour se déplacer en centre-ville.',
      tags: ['économique', 'ville', 'manuelle'], mileage: 38200, fuelTankCapacity: 38, depositAmount: 300, minDriverAge: 21,
      lastMaintenanceDate: new Date('2026-05-10'), nextMaintenanceDate: new Date('2026-11-10'), acquisitionDate: new Date('2022-02-15'), acquisitionCost: 28000
    },
    {
      name: 'Hyundai i10', brand: 'Hyundai', modelName: 'i10 Highgrade', year: 2023, category: 'Économique', transmission: 'Manuelle',
      fuel: 'Essence', seats: 5, doors: 4, bags: 2, pricePerDay: 23, pricePerWeek: 150, pricePerMonth: 580, color: 'Blanc',
      plate: '228-TU-1234', images: [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: false, cruiseControl: false, parkingSensors: true, camera360: false, sunroof: false, heatedSeats: false },
      status: 'Disponible', isActive: true, parc: createdParcs[0]._id,
      description: 'Citadine moderne avec un bel équipement de série et un grand confort de conduite.',
      tags: ['économique', 'confort', 'ville'], mileage: 21450, fuelTankCapacity: 40, depositAmount: 350, minDriverAge: 21,
      lastMaintenanceDate: new Date('2026-06-15'), nextMaintenanceDate: new Date('2026-12-15'), acquisitionDate: new Date('2023-01-20'), acquisitionCost: 34000
    },
    {
      name: 'Renault Clio 5', brand: 'Renault', modelName: 'Clio V Intens', year: 2023, category: 'Économique', transmission: 'Manuelle',
      fuel: 'Essence', seats: 5, doors: 5, bags: 3, pricePerDay: 26, pricePerWeek: 170, pricePerMonth: 650, color: 'Gris Titanium',
      plate: '230-TU-4567', images: [
        'https://images.unsplash.com/photo-1609521263047-f8d205293f24?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: true, cruiseControl: true, parkingSensors: true, camera360: false, sunroof: false, heatedSeats: false },
      status: 'Disponible', isActive: true, parc: createdParcs[1]._id,
      description: 'La citadine préférée des Tunisiens. Élégante, très faible consommation et grand coffre.',
      tags: ['économique', 'populaire', 'route'], mileage: 16800, fuelTankCapacity: 42, depositAmount: 400, minDriverAge: 21,
      lastMaintenanceDate: new Date('2026-07-01'), nextMaintenanceDate: new Date('2027-01-01'), acquisitionDate: new Date('2023-03-10'), acquisitionCost: 42000
    },
    {
      name: 'Peugeot 301', brand: 'Peugeot', modelName: '301 Allure', year: 2022, category: 'Berline', transmission: 'Manuelle',
      fuel: 'Essence', seats: 5, doors: 4, bags: 4, pricePerDay: 31, pricePerWeek: 200, pricePerMonth: 780, color: 'Noir Perla',
      plate: '221-TU-9012', images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: false, cruiseControl: true, parkingSensors: true, camera360: false, sunroof: false, heatedSeats: false },
      status: 'Disponible', isActive: true, parc: createdParcs[0]._id,
      description: 'Grande berline fiable et très confortable avec un coffre immense de 506 litres.',
      tags: ['berline', 'famille', 'voyage'], mileage: 45200, fuelTankCapacity: 50, depositAmount: 450, minDriverAge: 21,
      lastMaintenanceDate: new Date('2026-05-20'), nextMaintenanceDate: new Date('2026-11-20'), acquisitionDate: new Date('2022-04-12'), acquisitionCost: 48000
    },
    {
      name: 'Volkswagen Golf 7', brand: 'Volkswagen', year: 2023, category: 'Compacte', transmission: 'Automatique',
      fuel: 'Essence', seats: 5, doors: 5, bags: 3, pricePerDay: 40, pricePerWeek: 260, pricePerMonth: 980, color: 'Bleu Atlantique',
      plate: '232-TU-3456', images: [
        'https://images.unsplash.com/photo-1541348263662-e068662d82af?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: true, cruiseControl: true, parkingSensors: true, camera360: false, sunroof: true, heatedSeats: false },
      status: 'Disponible', isActive: true, parc: createdParcs[1]._id,
      description: 'Compacte allemande dynamique avec boite automatique DSG7 ultra fluide.',
      tags: ['compacte', 'automatique', 'german'], mileage: 12900, fuelTankCapacity: 50, depositAmount: 550, minDriverAge: 23,
      lastMaintenanceDate: new Date('2026-06-25'), nextMaintenanceDate: new Date('2026-12-25'), acquisitionDate: new Date('2023-05-01'), acquisitionCost: 68000
    },
    {
      name: 'Kia Sportage', brand: 'Kia', modelName: 'Sportage GT-Line', year: 2023, category: 'SUV', transmission: 'Automatique',
      fuel: 'Diesel', seats: 5, doors: 5, bags: 4, pricePerDay: 55, pricePerWeek: 360, pricePerMonth: 1350, color: 'Gris Acier',
      plate: '234-TU-7890', images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: true, cruiseControl: true, parkingSensors: true, camera360: true, sunroof: true, heatedSeats: true },
      status: 'Maintenance', isActive: true, parc: createdParcs[2]._id,
      description: 'SUV spacieux et suréquipé. Idéal pour explorer toute la Tunisie en famille.',
      tags: ['suv', 'diesel', 'confort'], mileage: 28900, fuelTankCapacity: 54, depositAmount: 700, minDriverAge: 23,
      lastMaintenanceDate: new Date('2026-08-01'), nextMaintenanceDate: new Date('2026-08-15'), acquisitionDate: new Date('2023-04-18'), acquisitionCost: 95000
    },
    {
      name: 'BMW Série 3', brand: 'BMW', modelName: '320i M Sport', year: 2022, category: 'Berline', transmission: 'Automatique',
      fuel: 'Essence', seats: 5, doors: 4, bags: 3, pricePerDay: 85, pricePerWeek: 550, pricePerMonth: 2100, color: 'Noir Saphir',
      plate: '225-TU-8888', images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'
      ],
      model3dUrl: 'https://res.cloudinary.com/ddf8htsld/raw/upload/v1785019147/tunisia-car-rental/3d-models/bmw_3_series_325li.glb',
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: true, cruiseControl: true, parkingSensors: true, camera360: true, sunroof: true, heatedSeats: true },
      status: 'Disponible', isActive: true, parc: createdParcs[0]._id,
      description: 'Berline de prestige sportive. Modèle 3D disponible pour prévisualisation.',
      tags: ['luxe', 'bmw', 'prestige', '3d'], mileage: 19500, fuelTankCapacity: 59, depositAmount: 1000, minDriverAge: 25,
      lastMaintenanceDate: new Date('2026-07-10'), nextMaintenanceDate: new Date('2027-01-10'), acquisitionDate: new Date('2022-09-05'), acquisitionCost: 145000
    },
    {
      name: 'Audi Q5', brand: 'Audi', modelName: 'Q5 S-Line', year: 2021, category: 'SUV', transmission: 'Automatique',
      fuel: 'Diesel', seats: 5, doors: 5, bags: 4, pricePerDay: 95, pricePerWeek: 620, pricePerMonth: 2400, color: 'Blanc Glacier',
      plate: '218-TU-9999', images: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: true, cruiseControl: true, parkingSensors: true, camera360: true, sunroof: true, heatedSeats: true },
      status: 'Disponible', isActive: true, parc: createdParcs[3]._id,
      description: 'SUV de haut standing Quattro avec suspension pneumatique et sellerie cuir.',
      tags: ['luxe', 'audi', 'quattro'], mileage: 34100, fuelTankCapacity: 70, depositAmount: 1200, minDriverAge: 25,
      lastMaintenanceDate: new Date('2026-06-20'), nextMaintenanceDate: new Date('2026-12-20'), acquisitionDate: new Date('2021-11-14'), acquisitionCost: 165000
    },
    {
      name: 'Mercedes-Benz GLC', brand: 'Mercedes', modelName: 'GLC 300 4MATIC', year: 2023, category: 'Luxe', transmission: 'Automatique',
      fuel: 'Hybride', seats: 5, doors: 5, bags: 4, pricePerDay: 120, pricePerWeek: 780, pricePerMonth: 3000, color: 'Noir Obsidienne',
      plate: '235-TU-0001', images: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: true, cruiseControl: true, parkingSensors: true, camera360: true, sunroof: true, heatedSeats: true },
      status: 'Disponible', isActive: true, parc: createdParcs[0]._id,
      description: 'Le sommet du confort et de l élégance. Motorisation hybride performante.',
      tags: ['ultra-luxe', 'mercedes', 'hybride'], mileage: 8200, fuelTankCapacity: 62, depositAmount: 1500, minDriverAge: 25,
      lastMaintenanceDate: new Date('2026-07-15'), nextMaintenanceDate: new Date('2027-01-15'), acquisitionDate: new Date('2023-06-01'), acquisitionCost: 210000
    },
    {
      name: 'Toyota Yaris Hybride', brand: 'Toyota', modelName: 'Yaris Style', year: 2023, category: 'Compacte', transmission: 'Automatique',
      fuel: 'Hybride', seats: 5, doors: 5, bags: 2, pricePerDay: 35, pricePerWeek: 230, pricePerMonth: 850, color: 'Bronze',
      plate: '231-TU-5678', images: [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: true, cruiseControl: true, parkingSensors: true, camera360: false, sunroof: false, heatedSeats: false },
      status: 'Disponible', isActive: true, parc: createdParcs[1]._id,
      description: 'Consommation record sous les 3.8L/100km. Silencieuse et très douce.',
      tags: ['hybride', 'écologique', 'automatique'], mileage: 14200, fuelTankCapacity: 36, depositAmount: 450, minDriverAge: 21,
      lastMaintenanceDate: new Date('2026-05-30'), nextMaintenanceDate: new Date('2026-11-30'), acquisitionDate: new Date('2023-02-10'), acquisitionCost: 55000
    },
    {
      name: 'Mercedes-Benz Vito 9 Places', brand: 'Mercedes', modelName: 'Vito Tourer', year: 2022, category: 'Monospace', transmission: 'Automatique',
      fuel: 'Diesel', seats: 9, doors: 5, bags: 6, pricePerDay: 90, pricePerWeek: 580, pricePerMonth: 2200, color: 'Argent',
      plate: '223-TU-1122', images: [
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: true, cruiseControl: true, parkingSensors: true, camera360: false, sunroof: false, heatedSeats: false },
      status: 'Disponible', isActive: true, parc: createdParcs[0]._id,
      description: 'Van 9 places grande capacité pour groupes et grandes familles.',
      tags: ['monospace', '9places', 'groupe'], mileage: 39000, fuelTankCapacity: 70, depositAmount: 1000, minDriverAge: 25,
      lastMaintenanceDate: new Date('2026-06-10'), nextMaintenanceDate: new Date('2026-12-10'), acquisitionDate: new Date('2022-07-20'), acquisitionCost: 120000
    },
    {
      name: 'Peugeot Partner Camionnette', brand: 'Peugeot', modelName: 'Partner L2', year: 2022, category: 'Utilitaire', transmission: 'Manuelle',
      fuel: 'Diesel', seats: 3, doors: 4, bags: 6, pricePerDay: 38, pricePerWeek: 240, pricePerMonth: 900, color: 'Blanc',
      plate: '220-TU-3344', images: [
        'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: false, cruiseControl: false, parkingSensors: true, camera360: false, sunroof: false, heatedSeats: false },
      status: 'Disponible', isActive: true, parc: createdParcs[0]._id,
      description: 'Véhicule utilitaire de transport de marchandises et déménagements.',
      tags: ['utilitaire', 'transport', 'pro'], mileage: 51200, fuelTankCapacity: 53, depositAmount: 500, minDriverAge: 21,
      lastMaintenanceDate: new Date('2026-04-15'), nextMaintenanceDate: new Date('2026-10-15'), acquisitionDate: new Date('2022-03-01'), acquisitionCost: 45000
    },
    {
      name: 'Tesla Model 3', brand: 'Tesla', modelName: 'Model 3 Long Range', year: 2023, category: 'Luxe', transmission: 'Automatique',
      fuel: 'Électrique', seats: 5, doors: 4, bags: 3, pricePerDay: 130, pricePerWeek: 850, pricePerMonth: 3200, color: 'Rouge Multicouches',
      plate: '233-TU-7777', images: [
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'
      ],
      features: { ac: true, bluetooth: true, radio: true, usb: true, gps: true, cruiseControl: true, parkingSensors: true, camera360: true, sunroof: true, heatedSeats: true },
      status: 'Disponible', isActive: true, parc: createdParcs[0]._id,
      description: '100% électrique avec 500km d autonomie. Autopilot et écran 15 pouces.',
      tags: ['électrique', 'tesla', 'high-tech'], mileage: 9800, fuelTankCapacity: 0, depositAmount: 1500, minDriverAge: 25,
      lastMaintenanceDate: new Date('2026-07-01'), nextMaintenanceDate: new Date('2027-01-01'), acquisitionDate: new Date('2023-05-15'), acquisitionCost: 180000
    }
  ];

  const createdVehicles: any[] = [];
  for (const v of vehiclesData) {
    const vehicle = await Vehicle.create(v);
    createdVehicles.push(vehicle);
    console.log(`🚗 Created Vehicle: ${v.name} (${v.category}) — ${v.pricePerDay} TND/day [${v.status}]`);
  }

  console.log('');

  // 4. Create Reservations covering ALL test cases (Past, In-Progress, Future, Cancelled, Paid, Partial, Unpaid)
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const reservationsData: any[] = [
    // 1. Completed & fully paid reservation (Past)
    {
      vehicle: createdVehicles[0]._id, // Fiat Panda
      user: createdUsers[2]._id,       // Ahmed
      pickupLocation: 'Aéroport Tunis-Carthage',
      dropoffLocation: 'Centre Ville Sousse',
      pickupDate: addDays(today, -30),
      dropoffDate: addDays(today, -23),
      driverAge: 28,
      totalDays: 7,
      pricePerDay: 20,
      subtotalHT: 118.64,
      tva: 21.36,
      totalTTC: 140,
      depositAmount: 300,
      paymentOption: 'total',
      amountPaid: 140,
      remainingBalance: 0,
      paymentStatus: 'paid',
      paymentMethod: 'carte',
      paymentReference: 'TXN-CARD-2026-07-10',
      status: 'completed',
      options: ['Siège bébé (+5 TND/j)', 'Conducteur additionnel'],
      notes: 'Paiement effectué en ligne par carte bancaire.',
      internalNotes: 'Véhicule rendu très propre. RAS.',
      confirmedAt: addDays(today, -35),
      completedAt: addDays(today, -23),
      mileageAtPickup: 37500,
      mileageAtDropoff: 38200,
    },
    // 2. Active rental currently IN PROGRESS (Started 2 days ago, ends in 3 days)
    {
      vehicle: createdVehicles[2]._id, // Renault Clio 5
      user: createdUsers[3]._id,       // Fatima
      pickupLocation: 'Parc Sousse - Port El Kantaoui',
      dropoffLocation: 'Aéroport Tunis-Carthage',
      pickupDate: addDays(today, -2),
      dropoffDate: addDays(today, 3),
      driverAge: 32,
      totalDays: 5,
      pricePerDay: 26,
      subtotalHT: 110.17,
      tva: 19.83,
      totalTTC: 130,
      depositAmount: 400,
      paymentOption: 'moitie',
      amountPaid: 65,
      remainingBalance: 65,
      paymentStatus: 'partial',
      paymentMethod: 'carte',
      paymentReference: 'TXN-CLICK-2026-08-06',
      status: 'confirmed',
      options: ['GPS Tunisie (+3 TND/j)'],
      notes: 'Le solde restant de 65 TND sera réglé au retour.',
      internalNotes: 'Client a la voiture. Restitution le 11 août.',
      confirmedAt: addDays(today, -5),
      mileageAtPickup: 16800,
    },
    // 3. Upcoming Confirmed Reservation (Starts tomorrow)
    {
      vehicle: createdVehicles[4]._id, // Golf 7
      user: createdUsers[4]._id,       // Karim
      pickupLocation: 'Aéroport Tunis-Carthage',
      dropoffLocation: 'Aéroport Tunis-Carthage',
      pickupDate: addDays(today, 1),
      dropoffDate: addDays(today, 8),
      driverAge: 45,
      totalDays: 7,
      pricePerDay: 40,
      subtotalHT: 237.29,
      tva: 42.71,
      totalTTC: 280,
      depositAmount: 550,
      paymentOption: 'total',
      amountPaid: 280,
      remainingBalance: 0,
      paymentStatus: 'paid',
      paymentMethod: 'virement',
      paymentReference: 'VIR-BANK-2026-08-07',
      status: 'confirmed',
      options: ['Plein de carburant au départ'],
      notes: 'Arrivée vol TU-720 à 14h30.',
      internalNotes: 'Paiement virement reçu sur compte BIAT.',
      confirmedAt: addDays(today, -1),
    },
    // 4. Pending Unpaid Reservation (Needs Admin approval)
    {
      vehicle: createdVehicles[6]._id, // BMW Série 3
      user: createdUsers[5]._id,       // Nadia
      pickupLocation: 'Aéroport Tunis-Carthage',
      dropoffLocation: 'Parc Hammamet Nord',
      pickupDate: addDays(today, 5),
      dropoffDate: addDays(today, 12),
      driverAge: 26,
      totalDays: 7,
      pricePerDay: 85,
      subtotalHT: 504.24,
      tva: 90.76,
      totalTTC: 595,
      depositAmount: 1000,
      paymentOption: 'acompte',
      amountPaid: 59.50,
      remainingBalance: 535.50,
      paymentStatus: 'partial',
      paymentMethod: 'carte',
      paymentReference: 'TXN-PENDING-009',
      status: 'pending',
      options: ['Assurance Tous Risques', 'GPS'],
      notes: 'Demande de livraison à l hôtel Hasdrubal.',
      internalNotes: 'En attente de vérification du permis de conduire.',
    },
    // 5. Cancelled & Refunded Reservation
    {
      vehicle: createdVehicles[5]._id, // Kia Sportage
      user: createdUsers[6]._id,       // Youssef
      pickupLocation: 'Parc Sousse - Port El Kantaoui',
      dropoffLocation: 'Parc Sousse - Port El Kantaoui',
      pickupDate: addDays(today, -10),
      dropoffDate: addDays(today, -5),
      driverAge: 30,
      totalDays: 5,
      pricePerDay: 55,
      subtotalHT: 233.05,
      tva: 41.95,
      totalTTC: 275,
      depositAmount: 700,
      paymentOption: 'total',
      amountPaid: 275,
      remainingBalance: 0,
      paymentStatus: 'refunded',
      paymentMethod: 'carte',
      paymentReference: 'REFUND-2026-08-01',
      status: 'cancelled',
      cancelReason: 'Vol d avion annulé par la compagnie aérienne',
      notes: 'Le client a présenté son justificatif d annulation de vol.',
      internalNotes: 'Remboursement intégral effectué le 01/08/2026.',
      cancelledAt: addDays(today, -11),
    },
    // 6. Completed Reservation (Karim - BMW Série 3)
    {
      vehicle: createdVehicles[6]._id, // BMW Série 3
      user: createdUsers[4]._id,       // Karim
      pickupLocation: 'Aéroport Tunis-Carthage',
      dropoffLocation: 'Aéroport Tunis-Carthage',
      pickupDate: addDays(today, -20),
      dropoffDate: addDays(today, -15),
      driverAge: 45,
      totalDays: 5,
      pricePerDay: 85,
      subtotalHT: 360.17,
      tva: 64.83,
      totalTTC: 425,
      depositAmount: 1000,
      paymentOption: 'total',
      amountPaid: 425,
      remainingBalance: 0,
      paymentStatus: 'paid',
      paymentMethod: 'especes',
      paymentReference: 'REC-CASH-4412',
      status: 'completed',
      options: ['Assurance Tous Risques'],
      notes: 'Paiement intégral comptant à la prise en main.',
      internalNotes: 'Client VIP. Remise accordée.',
      confirmedAt: addDays(today, -25),
      completedAt: addDays(today, -15),
      mileageAtPickup: 19000,
      mileageAtDropoff: 19500,
    },
    // 7. REÇU — New request awaiting admin approval (car stays Disponible)
    {
      vehicle: createdVehicles[1]._id, // Hyundai i10
      user: createdUsers.find((u:any) => u.email === 'fatima@example.com')?._id ?? createdUsers[3]._id,
      pickupLocation: 'Aéroport Tunis-Carthage',
      dropoffLocation: 'Parc Hammamet Nord',
      pickupDate: addDays(today, 3),
      dropoffDate: addDays(today, 8),
      driverAge: 32,
      totalDays: 5,
      pricePerDay: 23,
      subtotalHT: 96.64,
      tva: 18.36,
      totalTTC: 115,
      depositAmount: 350,
      paymentOption: 'acompte',
      amountPaid: 11.50,
      remainingBalance: 103.50,
      paymentStatus: 'partial',
      status: 'recu',
      acceptAlternative: true,
      options: ['Siège bébé (+5 TND/j)'],
      notes: 'Première demande. En attente de confirmation admin.',
    },
    // 8. REÇU — Another pending request on a different car
    {
      vehicle: createdVehicles[9]._id, // Toyota Yaris Hybride
      user: createdUsers.find((u:any) => u.email === 'sarah@example.com')?._id ?? createdUsers[7]._id,
      pickupLocation: 'Parc Sousse - Port El Kantaoui',
      dropoffLocation: 'Parc Sousse - Port El Kantaoui',
      pickupDate: addDays(today, 7),
      dropoffDate: addDays(today, 12),
      driverAge: 24,
      totalDays: 5,
      pricePerDay: 35,
      subtotalHT: 147.06,
      tva: 27.94,
      totalTTC: 175,
      depositAmount: 450,
      paymentOption: 'total',
      amountPaid: 175,
      remainingBalance: 0,
      paymentStatus: 'paid',
      status: 'recu',
      acceptAlternative: false,
      notes: 'Demande urgente — client souhaite exclusivement ce modèle.',
    },
  ];

  for (const r of reservationsData) {
    await Reservation.create(r);
    console.log(`📅 Created Reservation: ${r.status.toUpperCase()} [${r.paymentStatus}] - ${r.totalTTC} TND`);
  }

  console.log('\n');

  // 5. Create Holds for calendar testing
  const holdsData = [
    {
      vehicle: createdVehicles[1]._id, // Hyundai i10
      user: createdUsers[2]._id,       // Ahmed
      pickupDate: addDays(today, 10),
      dropoffDate: addDays(today, 14),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    }
  ];

  for (const h of holdsData) {
    await Hold.create(h);
    console.log(`🔒 Created Temporary Hold for Vehicle ID: ${h.vehicle}`);
  }

  // ── 6. Seed Apartments / Vacation Stays ─────────────────────────────────────
  console.log('\n🏡 Seeding Tunisian Apartments & Vacation Stays...');
  const apartmentsData = [
    {
      title: 'Dar El Medina — Vue Mer & Architecture Andalouse',
      description: 'Splendide demeure traditionnelle située sur les hauteurs de Sidi Bou Said. Profitez d’un patio arboré, d’un salon voûté aux faïences authentiques et d’un toit-terrasse avec vue imprenable sur le golfe de Tunis.',
      type: "Maison d'hôtes (Dar)",
      city: 'Sidi Bou Said',
      address: 'Rue Habib Thameur, Sidi Bou Said',
      pricePerNight: 290,
      cleaningFee: 40,
      depositAmount: 300,
      bedrooms: 2,
      bathrooms: 2,
      bedsCount: 4,
      maxGuests: 4,
      surfaceM2: 145,
      minNights: 2,
      amenities: { wifi: true, ac: true, pool: false, seaView: true, parking: true, kitchen: true, tv: true, washingMachine: true, terrace: true, heating: true, elevator: false, petFriendly: false },
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      ],
      featured: true,
    },
    {
      title: 'Villa Blanche — Hammamet Sud & Piscine Privée',
      description: 'Villa contemporaine d’exception à 300 mètres de la plage. Grand jardin paysager, piscine sans vis-à-vis, 4 suites parentales et cuisine américaine entièrement équipée.',
      type: 'Villa',
      city: 'Hammamet',
      address: 'Zone Hôtelière Jinene Hammamet',
      pricePerNight: 580,
      cleaningFee: 70,
      depositAmount: 600,
      bedrooms: 4,
      bathrooms: 4,
      bedsCount: 6,
      maxGuests: 8,
      surfaceM2: 340,
      minNights: 3,
      amenities: { wifi: true, ac: true, pool: true, seaView: false, parking: true, kitchen: true, tv: true, washingMachine: true, terrace: true, heating: true, elevator: false, petFriendly: true },
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
        'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=1200&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80',
      ],
      featured: true,
    },
    {
      title: 'Menzel Djerbien Authentique — Palmeraie de Midoun',
      description: 'Vivez l’expérience djerbienne sous les coupoles blanchies à la chaux. Menzel traditionnel avec cour centrale, jardin de palmiers, calme absolu et tout le confort moderne.',
      type: "Maison d'hôtes (Dar)",
      city: 'Djerba',
      address: 'Route Touristique Midoun, Djerba',
      pricePerNight: 230,
      cleaningFee: 35,
      depositAmount: 250,
      bedrooms: 3,
      bathrooms: 2,
      bedsCount: 5,
      maxGuests: 6,
      surfaceM2: 190,
      minNights: 2,
      amenities: { wifi: true, ac: true, pool: true, seaView: false, parking: true, kitchen: true, tv: true, washingMachine: true, terrace: true, heating: true, elevator: false, petFriendly: true },
      images: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80',
      ],
      featured: false,
    },
    {
      title: 'Penthouse Moderne — Corniche La Marsa',
      description: 'Appartement de standing au dernier étage offrant une vue panoramique sur la Méditerranée. Proche des meilleurs cafés et restaurants de La Marsa.',
      type: 'Penthouse',
      city: 'La Marsa',
      address: 'Avenue Habib Bourguiba, La Marsa Plage',
      pricePerNight: 360,
      cleaningFee: 45,
      depositAmount: 400,
      bedrooms: 2,
      bathrooms: 2,
      bedsCount: 3,
      maxGuests: 4,
      surfaceM2: 130,
      minNights: 1,
      amenities: { wifi: true, ac: true, pool: false, seaView: true, parking: true, kitchen: true, tv: true, washingMachine: true, terrace: true, heating: true, elevator: true, petFriendly: false },
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
      ],
      featured: true,
    },
    {
      title: 'Dar Zitoune — Palmeraie & Piscine à Tozeur',
      description: 'Havre de paix aux portes du Sahara. Architecture en briques de Tozeur, patio ombragé par les palmiers et bassin de fraîcheur privé.',
      type: "Maison d'hôtes (Dar)",
      city: 'Tozeur',
      address: 'Oasis Palmeraie, Tozeur',
      pricePerNight: 195,
      cleaningFee: 30,
      depositAmount: 200,
      bedrooms: 2,
      bathrooms: 1,
      bedsCount: 3,
      maxGuests: 4,
      surfaceM2: 110,
      minNights: 1,
      amenities: { wifi: true, ac: true, pool: true, seaView: false, parking: true, kitchen: true, tv: true, washingMachine: false, terrace: true, heating: true, elevator: false, petFriendly: false },
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80',
      ],
      featured: false,
    }
  ];

  const createdApartments: any[] = [];
  for (const apt of apartmentsData) {
    const created = await Apartment.create(apt);
    createdApartments.push(created);
    console.log(`🏡 Created Apartment: ${created.title} (${created.city} - ${created.pricePerNight} TND/nuit)`);
  }

  // Apartment booking for user Ahmed
  await ApartmentReservation.create({
    apartment: createdApartments[0]._id,
    user: createdUsers[2]._id, // Ahmed
    checkInDate: addDays(today, 5),
    checkOutDate: addDays(today, 8),
    totalNights: 3,
    adults: 2,
    children: 1,
    pricePerNight: createdApartments[0].pricePerNight,
    subtotalHT: createdApartments[0].pricePerNight * 3,
    tva: Math.round(createdApartments[0].pricePerNight * 3 * 0.07),
    cleaningFee: createdApartments[0].cleaningFee,
    totalTTC: Math.round(createdApartments[0].pricePerNight * 3 * 1.07 + createdApartments[0].cleaningFee),
    depositAmount: createdApartments[0].depositAmount,
    status: 'confirmed',
    paymentStatus: 'paid',
    specialRequests: 'Arrivée prévue vers 16h.',
  });
  console.log(`📅 Created sample Apartment Reservation for Ahmed`);

  // ── 7. Seed Excursions / Field Trips ─────────────────────────────────────────
  console.log('\n🐪 Seeding Field Trips & Excursions...');
  const excursionsData = [
    {
      title: 'Grand Circuit Sahara : Tozeur, Chott El Djerid & Douz',
      description: 'Une aventure inoubliable de 2 jours à travers le grand Sud tunisien. Traversée féerique du lac salé, coucher de soleil à dos de dromadaire sur les dunes du Grand Erg Oriental et nuitée magique sous les étoiles.',
      category: 'Sahara & Désert',
      departureCity: 'Tunis',
      destination: 'Tozeur, Douz & Matmata',
      duration: '2 jours / 1 nuit',
      pricePerAdult: 350,
      pricePerChild: 200,
      maxGroupSize: 16,
      minGroupSize: 4,
      included: [
        'Transport en véhicule 4x4 tout-terrain avec chauffeur expérimenté',
        'Nuitée en campement saharien de charme avec dîner bédouin',
        'Balade en dromadaire ou quad dans les dunes au crépuscule',
        'Visite guidée des oasis de montagne (Chebika & Tamerza)',
        'Tous les repas et petits déjeuners',
      ],
      excluded: ['Boissons supplémentaires', 'Dépenses personnelles et pourboires'],
      itinerary: [
        { dayOrTime: 'Jour 1 - Matin', title: 'Départ de Tunis vers Kairouan et Tozeur', description: 'Halte à Kairouan pour admirer la Grande Mosquée, puis traversée panoramique vers le Sud.' },
        { dayOrTime: 'Jour 1 - Après-midi', title: 'Traversée du Chott El Djerid & Coucher du Soleil', description: 'Arrêt au lac salé avec mirages, arrivée à Douz "la porte du désert" et caravane en dromadaire.' },
        { dayOrTime: 'Jour 2 - Matin', title: 'Maisons Troglodytes de Matmata', description: 'Visite des célèbres habitations berbères souterraines et décors du film Star Wars.' },
        { dayOrTime: 'Jour 2 - Après-midi', title: 'Amphithéâtre d’El Jem & Retour', description: 'Visite du colisée romain d’El Jem avant le retour à Tunis en soirée.' },
      ],
      images: [
        'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80',
        'https://images.unsplash.com/photo-1547234935-80c7145ec969?w=1200&q=80',
      ],
      availableDays: ['Tous les vendredis et samedis'],
      featured: true,
    },
    {
      title: 'Trésors Antiques : Carthage, Sidi Bou Said & Médina de Tunis',
      description: 'Plongez au cœur de plus de 3000 ans d’histoire tunisienne. Des vestiges puniques et thermes d’Antonin de Carthage aux ruelles parfumées au jasmin de Sidi Bou Said, terminez par la vibrante Médina de Tunis classée UNESCO.',
      category: 'Culture & Histoire',
      departureCity: 'Tunis',
      destination: 'Carthage & Sidi Bou Said',
      duration: '1 jour',
      pricePerAdult: 120,
      pricePerChild: 65,
      maxGroupSize: 20,
      minGroupSize: 2,
      included: [
        'Guide touristique national diplômé en archéologie',
        'Billets d’entrée pour tous les sites de Carthage et musées',
        'Déjeuner gastronomique dans un palais restauré de la Médina',
        'Transport en minibus climatisé avec prise en charge hôtel',
      ],
      excluded: ['Dépenses personnelles'],
      itinerary: [
        { dayOrTime: '09:00 - 12:00', title: 'Sites Archéologiques de Carthage', description: 'Colline de Byrsa, musée, thermes d’Antonin et ports puniques.' },
        { dayOrTime: '12:30 - 14:00', title: 'Déjeuner traditionnel tunisien', description: 'Couscous au mérou, tajine et pâtisseries fines au cœur de la Médina.' },
        { dayOrTime: '14:30 - 17:00', title: 'Flânerie à Sidi Bou Said', description: 'Thé aux pignons au Café des Nattes et vue plongeante sur la baie.' },
      ],
      images: [
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=80',
        'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=80',
      ],
      availableDays: ['Tous les jours'],
      featured: true,
    },
    {
      title: 'Évasion Verte : Randonnée Forêts de Kroumirie & Aïn Draham',
      description: 'Découvrez la face verte et secrète de la Tunisie. Une journée vivifiante au cœur des chênaies de liège, des cascades d’Aïn Draham et des falaises de corail de Tabarka.',
      category: 'Randonnée & Nature',
      departureCity: 'Tunis',
      destination: 'Tabarka & Aïn Draham',
      duration: '1 jour',
      pricePerAdult: 95,
      pricePerChild: 50,
      maxGroupSize: 18,
      minGroupSize: 4,
      included: [
        'Encadrement par un guide de moyenne montagne breveté',
        'Pique-nique campagnard avec produits bio du terroir',
        'Visite du fort génois et des aiguilles de Tabarka',
        'Transport aller-retour en autocar grand tourisme',
      ],
      excluded: ['Matériel de marche personnel'],
      itinerary: [
        { dayOrTime: '07:30', title: 'Départ de Tunis vers le Nord-Ouest', description: 'Traversée de Béja et montée vers les monts de Kroumirie.' },
        { dayOrTime: '10:00 - 13:30', title: 'Trek en forêt & cascades', description: 'Parcours accessible à tous le long des cours d’eau ombragés.' },
        { dayOrTime: '14:30 - 16:30', title: 'Escapade maritime à Tabarka', description: 'Arrêt aux aiguilles rocheuses et temps libre sur le port de plaisance.' },
      ],
      images: [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
      ],
      availableDays: ['Tous les samedis et dimanches'],
      featured: false,
    },
    {
      title: 'Croisière Catamaran & Snorkeling aux Îles Kuriat',
      description: 'Embarquez pour une journée de rêve dans les eaux turquoise de l’archipel des Kuriat. Déjeuner barbecue de poissons à bord, observation des tortues marines et baignade dans des criques cristallines.',
      category: 'Mer & Bateau',
      departureCity: 'Sousse',
      destination: 'Îles Kuriat, Monastir',
      duration: '1 jour',
      pricePerAdult: 165,
      pricePerChild: 90,
      maxGroupSize: 22,
      minGroupSize: 6,
      included: [
        'Navigation privatisée en grand catamaran à voile',
        'Déjeuner grillades de la mer + boissons fraîches non alcoolisées',
        'Masques, tubas et paddles à disposition',
        'Skipper professionnel et équipage qualifié',
      ],
      excluded: ['Boissons alcoolisées'],
      itinerary: [
        { dayOrTime: '09:00', title: 'Embarquement à la Marina de Monastir', description: 'Accueil café, briefing de sécurité et hissage des voiles.' },
        { dayOrTime: '11:00 - 14:00', title: 'Mouillage à Kuriat & Barbecue', description: 'Baignade sur banc de sable blanc et repas préparé par le chef de bord.' },
        { dayOrTime: '14:30 - 17:00', title: 'Navigation retour & observation marine', description: 'Session snorkeling sur les herbiers de posidonie et retour au port.' },
      ],
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80',
      ],
      availableDays: ['Mardi', 'Jeudi', 'Samedi', 'Dimanche'],
      featured: true,
    }
  ];

  const createdExcursions: any[] = [];
  for (const exc of excursionsData) {
    const created = await Excursion.create(exc);
    createdExcursions.push(created);
    console.log(`🐪 Created Excursion: ${created.title} (${created.departureCity} - ${created.pricePerAdult} TND/pers)`);
  }

  // Excursion booking for user Ahmed
  await ExcursionReservation.create({
    excursion: createdExcursions[0]._id,
    user: createdUsers[2]._id, // Ahmed
    date: addDays(today, 12),
    adults: 2,
    children: 0,
    totalParticipants: 2,
    pricePerAdult: createdExcursions[0].pricePerAdult,
    pricePerChild: createdExcursions[0].pricePerChild,
    totalPrice: createdExcursions[0].pricePerAdult * 2,
    pickupLocation: 'Hôtel Mövenpick Gammarth',
    specialRequests: 'Chambre double sous tente avec lit bébé si possible.',
    status: 'confirmed',
    paymentStatus: 'paid',
  });
  console.log(`📅 Created sample Excursion Reservation for Ahmed`);

  console.log('\n=============================================================');
  console.log('✅ FULL DATASET SEED COMPLETED SUCCESSFULLY!');
  console.log('=============================================================');
  console.log('📋 ACCESSIBLE TEST ACCOUNTS (Password for ALL is: 12345678):\n');
  console.log('   👑 ADMIN ACCOUNTS:');
  console.log('      Email:    admin@tunisiacarrental.com');
  console.log('      Password: 12345678');
  console.log('      Email:    admin@africanrentcar.com');
  console.log('      Password: 12345678\n');
  console.log('   🛠️ MANAGER ACCOUNT:');
  console.log('      Email:    manager@tunisiacarrental.com');
  console.log('      Password: 12345678\n');
  console.log('   👤 CUSTOMER ACCOUNTS:');
  console.log('      1. ahmed@example.com   / 12345678 (Ahmed Guezguez)');
  console.log('      2. fatima@example.com  / 12345678 (Fatima Ben Saïd)');
  console.log('      3. karim@example.com   / 12345678 (Karim Al-Mansouri)');
  console.log('      4. nadia@example.com   / 12345678 (Nadia Boucher)');
  console.log('      5. youssef@example.com / 12345678 (Youssef Trabelsi)');
  console.log('      6. sarah@example.com   / 12345678 (Sarah Ben Ammar)');
  console.log('\n📊 SEEDED SUMMARY:');
  console.log(`   ✅ 13 Vehicles (all categories with high-res photos)`);
  console.log(`   ✅ 4 Parcs / Agences (Tunis, Sousse, Hammamet, Djerba)`);
  console.log(`   ✅ Users PRESERVED (not touched)`);
  console.log(`   ✅ 8 Reservations (2× Reçu, 1× En attente, 2× Confirmée, 2× Terminée, 1× Annulée)`);
  console.log(`   ✅ Active Temporary Holds`);
  console.log(`   ✅ New logic: only CONFIRMED locks car as Réservé`);
  console.log('=============================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
