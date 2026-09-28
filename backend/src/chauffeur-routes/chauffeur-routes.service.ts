import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChauffeurRoute, ChauffeurRouteDocument } from './schemas/chauffeur-route.schema';
import { ChauffeurReservation, ChauffeurReservationDocument } from './schemas/chauffeur-reservation.schema';
import { Chauffeur, ChauffeurDocument } from './schemas/chauffeur.schema';
import { ChauffeurLocation, ChauffeurLocationDocument } from './schemas/chauffeur-location.schema';
import { CreateChauffeurRouteDto } from './dto/create-chauffeur-route.dto';
import { CreateChauffeurReservationDto } from './dto/create-chauffeur-reservation.dto';
import { CreateChauffeurDto } from './dto/create-chauffeur.dto';
import { CreateChauffeurLocationDto } from './dto/create-chauffeur-location.dto';

const DEFAULT_CHAUFFEUR_ROUTES = [
  {
    title: 'Liaison Aéroport Tunis-Carthage ➔ Sousse Sahloul',
    from: 'Aéroport Tunis-Carthage (TUN)',
    to: 'Sousse Sahloul',
    fromCoords: { lat: 36.8510, lng: 10.2272, label: 'Aéroport Tunis-Carthage (TUN)' },
    toCoords: { lat: 35.8360, lng: 10.5982, label: 'Sousse Sahloul' },
    duration: '1h 40 min',
    distance: '142 km',
    basePriceTND: 150,
    popular: true,
    available: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    assignedChauffeur: {
      name: 'Hassen Trabelsi',
      phone: '+216 22 555 120',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      rating: 4.99,
      tripsCount: 680,
      languages: ['Français', 'العربية', 'English', 'Italiano'],
      vehicleModel: 'Mercedes-Benz Classe E 2025 Berline Prestige',
      vehiclePlate: '242 TU 8890',
      vehicleColor: 'Noir Obsidienne',
      amenities: [
        'Bouteilles d\'eau fraîches',
        'Connexion Wifi 5G illimitée',
        'Climatisation bi-zone feutrée',
        'Chargeurs universels (iPhone/Android)',
        'Pancarte nominative personnalisée',
      ],
    },
    includes: [
      'Chauffeur privé en costume bilingue',
      'Accueil personnalisé avec pancarte nominative',
      'Suivi de vol en temps réel (zéro stress en cas de retard)',
      'Péages d\'autoroute et 60 minutes d\'attente incluses',
    ],
    notes: 'Liaison directe autoroutière sans escale. Dépose directe à l\'adresse de votre choix à Sousse Sahloul.',
  },
  {
    title: 'Liaison Aéroport Tunis-Carthage ➔ Hammamet Sud & Yasmine',
    from: 'Aéroport Tunis-Carthage (TUN)',
    to: 'Hammamet Sud & Yasmine',
    fromCoords: { lat: 36.8510, lng: 10.2272, label: 'Aéroport Tunis-Carthage (TUN)' },
    toCoords: { lat: 36.3768, lng: 10.5518, label: 'Hammamet Sud & Yasmine' },
    duration: '45 min',
    distance: '65 km',
    basePriceTND: 95,
    popular: true,
    available: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    assignedChauffeur: {
      name: 'Kais Ben Amor',
      phone: '+216 28 440 900',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: 4.97,
      tripsCount: 510,
      languages: ['Français', 'العربية', 'Deutsch'],
      vehicleModel: 'Audi A6 Limousine Business',
      vehiclePlate: '238 TU 4512',
      vehicleColor: 'Gris Nardo',
      amenities: [
        'Wifi 5G à bord',
        'Siège enfant gratuit sur demande',
        'Rafraîchissements à discrétion',
        'Attente 60 min offerte à l\'aéroport',
      ],
    },
    includes: [
      'Accueil hall des arrivées',
      'Assistance bagages lourds',
      'Trajet direct par autoroute A1',
      'Tarif fixe tout compris sans supplément nuit',
    ],
    notes: 'Liaison rapide vers tous les complexes hôteliers et résidences de Hammamet.',
  },
  {
    title: 'Liaison Aéroport Enfidha ➔ Sousse Sahloul',
    from: 'Aéroport Enfidha-Hammamet (NBE)',
    to: 'Sousse Sahloul',
    fromCoords: { lat: 36.0758, lng: 10.4386, label: 'Aéroport Enfidha-Hammamet (NBE)' },
    toCoords: { lat: 35.8360, lng: 10.5982, label: 'Sousse Sahloul' },
    duration: '35 min',
    distance: '42 km',
    basePriceTND: 75,
    popular: true,
    available: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
    assignedChauffeur: {
      name: 'Sami Mansour',
      phone: '+216 25 310 880',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      rating: 4.96,
      tripsCount: 420,
      languages: ['Français', 'العربية', 'English'],
      vehicleModel: 'Mercedes Vito VIP 7 Places',
      vehiclePlate: '240 TU 1009',
      vehicleColor: 'Noir Profond',
      amenities: [
        'Configuration salon cuir VIP',
        'Grande capacité bagages volumineux',
        'Wifi haut débit & prises de recharge',
      ],
    },
    includes: [
      'Prise en charge personnalisée à Enfidha',
      'Véhicule spacieux idéal pour familles et groupes',
      'Assurance passagers tous risques',
    ],
    notes: 'Transfert privilégié depuis Enfidha jusqu\'aux cliniques et résidences de Sahloul.',
  },
  {
    title: 'Liaison Aéroport Djerba-Zarzis ➔ Midoun & Hôtels',
    from: 'Aéroport Djerba-Zarzis (DJE)',
    to: 'Midoun & Zone Hôtelière',
    fromCoords: { lat: 33.8750, lng: 10.7753, label: 'Aéroport Djerba-Zarzis (DJE)' },
    toCoords: { lat: 33.8078, lng: 10.9923, label: 'Midoun & Zone Hôtelière' },
    duration: '25 min',
    distance: '25 km',
    basePriceTND: 45,
    popular: true,
    available: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    assignedChauffeur: {
      name: 'Nidhal Gafsi',
      phone: '+216 97 882 140',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      rating: 4.98,
      tripsCount: 390,
      languages: ['Français', 'العربية', 'English'],
      vehicleModel: 'Volkswagen Passat Confort Business',
      vehiclePlate: '235 TU 7711',
      vehicleColor: 'Blanc Nacré',
      amenities: ['Climatisation douce', 'Bouteilles d\'eau minérale', 'Aide complète bagages'],
    },
    includes: [
      'Transfert direct sans arrêt partagé',
      'Accueil avec pancarte à Djerba',
      'Véhicule grand confort climatisé',
    ],
  },
  {
    title: 'Liaison Tunis Centre-Ville ➔ La Marsa & Sidi Bou Saïd',
    from: 'Tunis Centre-Ville',
    to: 'La Marsa & Sidi Bou Saïd',
    fromCoords: { lat: 36.8008, lng: 10.1800, label: 'Tunis Centre-Ville' },
    toCoords: { lat: 36.8782, lng: 10.3418, label: 'La Marsa & Sidi Bou Saïd' },
    duration: '25 min',
    distance: '18 km',
    basePriceTND: 50,
    popular: false,
    available: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1570733577524-3a047079e80d?auto=format&fit=crop&w=800&q=80',
    assignedChauffeur: {
      name: 'Yassine Dridi',
      phone: '+216 29 110 330',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
      rating: 4.95,
      tripsCount: 310,
      languages: ['Français', 'العربية'],
      vehicleModel: 'Peugeot 508 GT Line',
      vehiclePlate: '241 TU 6032',
      vehicleColor: 'Gris Platinium',
      amenities: ['Sellerie cuir', 'Conduite souple', 'Wifi 5G'],
    },
    includes: [
      'Course citadine rapide sans attente',
      'Véhicule haut de gamme climatisé',
      'Chauffeur professionnel courtois',
    ],
  },
  {
    title: 'Liaison Aéroport Tunis-Carthage ➔ Bizerte Centre & Vieux Port',
    from: 'Aéroport Tunis-Carthage (TUN)',
    to: 'Bizerte Centre & Vieux Port',
    fromCoords: { lat: 36.8510, lng: 10.2272, label: 'Aéroport Tunis-Carthage (TUN)' },
    toCoords: { lat: 37.2746, lng: 9.8739, label: 'Bizerte Centre & Vieux Port' },
    duration: '55 min',
    distance: '70 km',
    basePriceTND: 110,
    popular: false,
    available: true,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    assignedChauffeur: {
      name: 'Amine Rezgui',
      phone: '+216 26 441 552',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      rating: 4.94,
      tripsCount: 280,
      languages: ['Français', 'العربية', 'English'],
      vehicleModel: 'BMW Série 5 Berline Luxe',
      vehiclePlate: '239 TU 9940',
      vehicleColor: 'Bleu Nuit Métallisé',
      amenities: ['Climatisation bizone', 'Wifi 5G', 'Presse économique'],
    },
    includes: [
      'Trajet direct par autoroute A4',
      'Chauffeur professionnel certifié',
      'Dépose au Vieux Port ou à votre hôtel',
    ],
  },
];

const DEFAULT_CHAUFFEUR_LOCATIONS = [
  // Aéroports
  { name: 'Aéroport Tunis-Carthage (TUN)', type: 'both', category: 'airport', region: 'Grand Tunis', city: 'Tunis', popular: true, isActive: true, order: 1 },
  { name: 'Aéroport Enfidha-Hammamet (NBE)', type: 'both', category: 'airport', region: 'Sahel', city: 'Enfidha', popular: true, isActive: true, order: 2 },
  { name: 'Aéroport Djerba-Zarzis (DJE)', type: 'both', category: 'airport', region: 'Sud & Djerba', city: 'Djerba', popular: true, isActive: true, order: 3 },
  { name: 'Aéroport Monastir Habib Bourguiba (MIR)', type: 'both', category: 'airport', region: 'Sahel', city: 'Monastir', popular: true, isActive: true, order: 4 },
  { name: 'Aéroport Sfax-Thyna (SFA)', type: 'both', category: 'airport', region: 'Sahel', city: 'Sfax', popular: false, isActive: true, order: 5 },
  { name: 'Aéroport Tozeur-Nefta (TOE)', type: 'both', category: 'airport', region: 'Sud & Djerba', city: 'Tozeur', popular: false, isActive: true, order: 6 },

  // Grand Tunis
  { name: 'Tunis Centre-Ville (Avenue Habib Bourguiba)', type: 'both', category: 'city', region: 'Grand Tunis', city: 'Tunis', popular: true, isActive: true, order: 10 },
  { name: 'La Marsa, Sidi Bou Said & Gammarth', type: 'both', category: 'hotel_zone', region: 'Grand Tunis', city: 'La Marsa', popular: true, isActive: true, order: 11 },
  { name: 'Les Berges du Lac 1 & Lac 2', type: 'both', category: 'hotel_zone', region: 'Grand Tunis', city: 'Tunis', popular: false, isActive: true, order: 12 },
  { name: 'Gammarth Zone Hôtelière & Palaces', type: 'both', category: 'hotel_zone', region: 'Grand Tunis', city: 'Gammarth', popular: true, isActive: true, order: 13 },

  // Cap Bon & Hammamet
  { name: 'Hammamet Sud & Yasmine Hammamet', type: 'both', category: 'hotel_zone', region: 'Cap Bon', city: 'Hammamet', popular: true, isActive: true, order: 20 },
  { name: 'Hammamet Nord & Centre Historique', type: 'both', category: 'hotel_zone', region: 'Cap Bon', city: 'Hammamet', popular: false, isActive: true, order: 21 },
  { name: 'Nabeul Centre & Front de Mer', type: 'both', category: 'city', region: 'Cap Bon', city: 'Nabeul', popular: false, isActive: true, order: 22 },

  // Sahel
  { name: 'Sousse Sahloul & Hôpitaux', type: 'both', category: 'city', region: 'Sahel', city: 'Sousse', popular: true, isActive: true, order: 30 },
  { name: 'Port El Kantaoui & Zone Touristique', type: 'both', category: 'hotel_zone', region: 'Sahel', city: 'Hammam Sousse', popular: true, isActive: true, order: 31 },
  { name: 'Sousse Ville & Médina', type: 'both', category: 'city', region: 'Sahel', city: 'Sousse', popular: false, isActive: true, order: 32 },
  { name: 'Monastir Marina & Skanes', type: 'both', category: 'hotel_zone', region: 'Sahel', city: 'Monastir', popular: false, isActive: true, order: 33 },
  { name: 'Mahdia Zone Touristique & Corniche', type: 'both', category: 'hotel_zone', region: 'Sahel', city: 'Mahdia', popular: false, isActive: true, order: 34 },

  // Sud & Djerba
  { name: 'Midoun & Zone Hôtelière (Djerba)', type: 'both', category: 'hotel_zone', region: 'Sud & Djerba', city: 'Midoun', popular: true, isActive: true, order: 40 },
  { name: 'Houmt Souk & Port de Djerba', type: 'both', category: 'city', region: 'Sud & Djerba', city: 'Houmt Souk', popular: false, isActive: true, order: 41 },
  { name: 'Zarzis Ville & Hôtels Oasisiens', type: 'both', category: 'hotel_zone', region: 'Sud & Djerba', city: 'Zarzis', popular: false, isActive: true, order: 42 },
  { name: 'Tozeur Oasis & Palmeraie', type: 'both', category: 'hotel_zone', region: 'Sud & Djerba', city: 'Tozeur', popular: false, isActive: true, order: 43 },

  // Nord-Ouest & Centre
  { name: 'Bizerte Marina & Vieux Port', type: 'both', category: 'port', region: 'Nord-Ouest', city: 'Bizerte', popular: false, isActive: true, order: 50 },
  { name: 'Tabarka Marina & Aïn Draham', type: 'both', category: 'hotel_zone', region: 'Nord-Ouest', city: 'Tabarka', popular: false, isActive: true, order: 51 },
  { name: 'Kairouan Ville Sainte & Médina', type: 'both', category: 'city', region: 'Centre', city: 'Kairouan', popular: false, isActive: true, order: 52 },
];

@Injectable()
export class ChauffeurRoutesService implements OnModuleInit {
  constructor(
    @InjectModel(ChauffeurRoute.name)
    private readonly routeModel: Model<ChauffeurRouteDocument>,
    @InjectModel(ChauffeurReservation.name)
    private readonly resModel: Model<ChauffeurReservationDocument>,
    @InjectModel(Chauffeur.name)
    private readonly chauffeurModel: Model<ChauffeurDocument>,
    @InjectModel(ChauffeurLocation.name)
    private readonly locationModel: Model<ChauffeurLocationDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.routeModel.countDocuments();
    if (count === 0) {
      await this.routeModel.insertMany(DEFAULT_CHAUFFEUR_ROUTES);
      console.log(`[ChauffeurRoutesService] Seeded ${DEFAULT_CHAUFFEUR_ROUTES.length} default chauffeur routes`);
    } else {
      // Migrate existing routes that lack coordinates or need accurate coords
      const existingRoutes = await this.routeModel.find().exec();
      for (const r of existingRoutes) {
        const matchDefault = DEFAULT_CHAUFFEUR_ROUTES.find(
          d => d.from.toLowerCase() === r.from.toLowerCase() && d.to.toLowerCase() === r.to.toLowerCase()
        ) || DEFAULT_CHAUFFEUR_ROUTES.find(
          d => r.title?.toLowerCase().includes(d.to.toLowerCase())
        );
        if (matchDefault) {
          await this.routeModel.findByIdAndUpdate(r._id, {
            fromCoords: matchDefault.fromCoords,
            toCoords: matchDefault.toCoords,
          });
        }
      }
    }

    // Seed default standalone chauffeurs if empty
    const chfCount = await this.chauffeurModel.countDocuments();
    if (chfCount === 0) {
      const uniqueChauffeursMap = new Map();
      for (const r of (DEFAULT_CHAUFFEUR_ROUTES as any[])) {
        if (r.assignedChauffeur && r.assignedChauffeur.name) {
          if (!uniqueChauffeursMap.has(r.assignedChauffeur.name)) {
            uniqueChauffeursMap.set(r.assignedChauffeur.name, {
              name: r.assignedChauffeur.name,
              phone: r.assignedChauffeur.phone || '+216 22 000 000',
              email: `${r.assignedChauffeur.name.toLowerCase().replace(/\s+/g, '.')}@africanrentcar.tn`,
              avatar: r.assignedChauffeur.avatar,
              rating: r.assignedChauffeur.rating || 4.95,
              experienceYears: r.assignedChauffeur.experienceYears || (r.assignedChauffeur.tripsCount ? Math.floor(r.assignedChauffeur.tripsCount / 100) + 5 : 8),
              languages: r.assignedChauffeur.languages || r.assignedChauffeur.spokenLanguages || ['Français', 'العربية', 'English'],
              vehicleModel: r.assignedChauffeur.vehicleModel || 'Mercedes-Benz Classe E',
              vehicleType: r.vehicleType || 'business-sedan',
              vehiclePlate: r.assignedChauffeur.vehiclePlate || '220 TU 1000',
              vehicleColor: r.assignedChauffeur.vehicleColor || 'Noir Obsidienne',
              city: r.from?.includes('Tunis') ? 'Tunis' : (r.from?.includes('Djerba') ? 'Djerba' : 'Sousse'),
              status: 'active',
              available: true,
              bio: 'Chauffeur d’élite certifié pour liaisons aéroport, transferts interurbains et délégations VIP.',
            });
          }
        }
      }
      if (uniqueChauffeursMap.size > 0) {
        await this.chauffeurModel.insertMany(Array.from(uniqueChauffeursMap.values()));
        console.log(`[ChauffeurRoutesService] Seeded ${uniqueChauffeursMap.size} default chauffeurs`);
      }
    }

    // Seed default transfer locations if empty
    const locCount = await this.locationModel.countDocuments();
    if (locCount === 0) {
      await this.locationModel.insertMany(DEFAULT_CHAUFFEUR_LOCATIONS);
      console.log(`[ChauffeurRoutesService] Seeded ${DEFAULT_CHAUFFEUR_LOCATIONS.length} default locations`);
    }
  }

  async getAll(): Promise<ChauffeurRouteDocument[]> {
    return this.routeModel.find().sort({ popular: -1, createdAt: -1 }).exec();
  }

  async getOne(id: string): Promise<ChauffeurRouteDocument> {
    const route = await this.routeModel.findById(id).exec();
    if (!route) throw new NotFoundException('Liaison chauffeur introuvable');
    return route;
  }

  async checkRoute(from: string, to: string) {
    if (!from || !to) {
      return { found: false, route: null };
    }

    const cleanFrom = from.toLowerCase().trim();
    const cleanTo = to.toLowerCase().trim();

    // Exact or fuzzy match
    const routes = await this.routeModel.find().exec();
    const matched = routes.find((r) => {
      const rFrom = r.from.toLowerCase();
      const rTo = r.to.toLowerCase();
      const matchA = rFrom.includes(cleanFrom) || cleanFrom.includes(rFrom);
      const matchB = rTo.includes(cleanTo) || cleanTo.includes(rTo);
      return matchA && matchB;
    });

    if (matched) {
      return {
        found: true,
        hasChauffeur: matched.available && !!matched.assignedChauffeur?.name,
        route: matched,
      };
    }

    return { found: false, hasChauffeur: false, route: null };
  }

  async create(dto: CreateChauffeurRouteDto): Promise<ChauffeurRouteDocument> {
    if (!dto.title || !dto.title.trim()) {
      dto.title = `${dto.from} ➔ ${dto.to}`;
    }
    return this.routeModel.create(dto);
  }

  async update(id: string, dto: Partial<CreateChauffeurRouteDto>): Promise<ChauffeurRouteDocument> {
    const route = await this.routeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!route) throw new NotFoundException('Liaison chauffeur introuvable');
    return route;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const res = await this.routeModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Liaison chauffeur introuvable');
    return { success: true };
  }

  async bookRoute(routeId: string, dto: CreateChauffeurReservationDto, userId?: string): Promise<ChauffeurReservationDocument> {
    const route = await this.routeModel.findById(routeId).exec();
    const created = await this.resModel.create({
      routeId,
      routeName: dto.routeName || (route ? `${route.from} ➔ ${route.to}` : 'Liaison Chauffeur'),
      from: dto.from || route?.from || '',
      to: dto.to || route?.to || '',
      chauffeurName: dto.chauffeurName || route?.assignedChauffeur?.name || 'Chauffeur Dédié',
      vehicleModel: dto.vehicleModel || route?.assignedChauffeur?.vehicleModel || 'Berline Prestige',
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      date: dto.date,
      time: dto.time,
      flightNumber: dto.flightNumber || '',
      passengers: dto.passengers || 1,
      luggage: dto.luggage || 1,
      priceTND: dto.priceTND || route?.basePriceTND || 100,
      notes: dto.notes || '',
      status: dto.status || 'pending',
      ...(userId ? { userId } : {}),
    });
    return created;
  }

  async getReservations(filter: { userId?: string; role?: string; email?: string } = {}): Promise<ChauffeurReservationDocument[]> {
    const query: any = {};
    if (filter.role !== 'admin') {
      const orClauses: any[] = [];
      if (filter.userId) orClauses.push({ userId: filter.userId });
      if (filter.email) orClauses.push({ email: filter.email.toLowerCase() });
      if (orClauses.length > 0) {
        query.$or = orClauses;
      }
    }
    return this.resModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async updateReservationStatus(id: string, status: string): Promise<ChauffeurReservationDocument> {
    const res = await this.resModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!res) throw new NotFoundException('Réservation introuvable');
    return res;
  }

  // ── Standalone Chauffeurs Management ──
  async getAllChauffeurs(): Promise<any[]> {
    const chauffeurs = await this.chauffeurModel.find().sort({ createdAt: -1 }).exec();
    const routes = await this.routeModel.find().exec();

    return chauffeurs.map((ch) => {
      const assignedRoutes = routes
        .filter(
          (r) =>
            r.assignedChauffeur?.name &&
            r.assignedChauffeur.name.toLowerCase().trim() === ch.name.toLowerCase().trim(),
        )
        .map((r) => ({
          _id: r._id,
          title: r.title || `${r.from} ➔ ${r.to}`,
          from: r.from,
          to: r.to,
          basePriceTND: r.basePriceTND,
          available: r.available,
        }));

      return {
        ...ch.toObject(),
        assignedRoutes,
        assignedRoutesCount: assignedRoutes.length,
      };
    });
  }

  async getChauffeurById(id: string): Promise<ChauffeurDocument> {
    const chauffeur = await this.chauffeurModel.findById(id).exec();
    if (!chauffeur) throw new NotFoundException('Chauffeur introuvable');
    return chauffeur;
  }

  async createChauffeur(dto: CreateChauffeurDto): Promise<ChauffeurDocument> {
    const created = new this.chauffeurModel(dto);
    return created.save();
  }

  async updateChauffeur(id: string, dto: Partial<CreateChauffeurDto>): Promise<ChauffeurDocument> {
    const updated = await this.chauffeurModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Chauffeur introuvable');
    return updated;
  }

  async toggleChauffeur(id: string): Promise<ChauffeurDocument> {
    const ch = await this.chauffeurModel.findById(id).exec();
    if (!ch) throw new NotFoundException('Chauffeur introuvable');
    ch.status = ch.status === 'active' ? 'inactive' : 'active';
    ch.available = ch.status === 'active';
    return ch.save();
  }

  async deleteChauffeur(id: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.chauffeurModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Chauffeur introuvable');
    return { success: true, message: 'Chauffeur supprimé avec succès' };
  }

  // ══════════════ LOCATIONS MANAGEMENT (CRUD) ══════════════

  async getActiveLocations(type?: string): Promise<ChauffeurLocationDocument[]> {
    const filter: any = { isActive: true };
    if (type && type !== 'all') {
      filter.type = { $in: [type, 'both'] };
    }
    return this.locationModel
      .find(filter)
      .sort({ popular: -1, order: 1, name: 1 })
      .exec();
  }

  async getAllLocations(): Promise<ChauffeurLocationDocument[]> {
    return this.locationModel
      .find()
      .sort({ popular: -1, order: 1, name: 1 })
      .exec();
  }

  async createLocation(dto: CreateChauffeurLocationDto): Promise<ChauffeurLocationDocument> {
    const loc = new this.locationModel(dto);
    return loc.save();
  }

  async updateLocation(id: string, dto: Partial<CreateChauffeurLocationDto>): Promise<ChauffeurLocationDocument> {
    const loc = await this.locationModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!loc) throw new NotFoundException('Lieu introuvable');
    return loc;
  }

  async deleteLocation(id: string): Promise<{ success: boolean; message: string }> {
    const res = await this.locationModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Lieu introuvable');
    return { success: true, message: 'Lieu supprimé avec succès' };
  }

  async toggleLocation(id: string): Promise<ChauffeurLocationDocument> {
    const loc = await this.locationModel.findById(id).exec();
    if (!loc) throw new NotFoundException('Lieu introuvable');
    loc.isActive = !loc.isActive;
    return loc.save();
  }
}
