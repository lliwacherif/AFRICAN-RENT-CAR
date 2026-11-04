import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChauffeurRoute, ChauffeurRouteDocument, DEFAULT_PRIVATE_CHAUFFEUR, withPrivateChauffeur } from './schemas/chauffeur-route.schema';
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
    // An empty collection can be intentional after admin deletions. Never
    // recreate default routes or locations during application startup.
    const existingRoutes = await this.routeModel.find().exec();
    for (const route of existingRoutes) {
      const matchDefault = DEFAULT_CHAUFFEUR_ROUTES.find(
        d => d.from.toLowerCase() === route.from.toLowerCase() && d.to.toLowerCase() === route.to.toLowerCase()
      ) || DEFAULT_CHAUFFEUR_ROUTES.find(
        d => route.title?.toLowerCase().includes(d.to.toLowerCase())
      );
      if (matchDefault) {
        await this.routeModel.findByIdAndUpdate(route._id, {
          fromCoords: matchDefault.fromCoords,
          toCoords: matchDefault.toCoords,
        });
      }
    }
  }

  async getAll(): Promise<ChauffeurRouteDocument[]> {
    const routes = await this.routeModel.find().sort({ popular: -1, createdAt: -1 }).exec();
    return routes.map(route => this.includePrivateChauffeur(route));
  }

  private includePrivateChauffeur(route: ChauffeurRouteDocument): ChauffeurRouteDocument {
    route.assignedChauffeur = withPrivateChauffeur(route.assignedChauffeur);
    return route;
  }

  async getOne(id: string): Promise<ChauffeurRouteDocument> {
    const route = await this.routeModel.findById(id).exec();
    if (!route) throw new NotFoundException('Liaison chauffeur introuvable');
    return this.includePrivateChauffeur(route);
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
        hasChauffeur: matched.available,
        route: this.includePrivateChauffeur(matched),
      };
    }

    return { found: false, hasChauffeur: false, route: null };
  }

  async create(dto: CreateChauffeurRouteDto): Promise<ChauffeurRouteDocument> {
    if (!dto.title || !dto.title.trim()) {
      dto.title = `${dto.from} ➔ ${dto.to}`;
    }
    return this.routeModel.create({ ...dto, assignedChauffeur: withPrivateChauffeur(dto.assignedChauffeur) });
  }

  async update(id: string, dto: Partial<CreateChauffeurRouteDto>): Promise<ChauffeurRouteDocument> {
    const existing = await this.getOne(id);
    const update = {
      ...dto,
      assignedChauffeur: withPrivateChauffeur({ ...existing.assignedChauffeur, ...dto.assignedChauffeur }),
    };
    const route = await this.routeModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!route) throw new NotFoundException('Liaison chauffeur introuvable');
    return this.includePrivateChauffeur(route);
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
      chauffeurName: DEFAULT_PRIVATE_CHAUFFEUR.name,
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

  async deleteReservation(id: string): Promise<{ success: boolean; message: string }> {
    const res = await this.resModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Réservation introuvable');
    return { success: true, message: 'Réservation supprimée avec succès' };
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
