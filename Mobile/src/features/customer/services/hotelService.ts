import { fakeHotels } from '../data/fakeHotels';
import { HotelSearchParams, HotelSearchResult, HotelDetail } from '../types/hotel';
import { apiGet } from '../../../shared/api/apiClient';

type BackendHotelImage = {
  id: string;
  url?: string | null;
  caption?: string | null;
};

type BackendHotelAmenity = {
  id: string;
  name?: string | null;
  description?: string | null;
  icon?: string | null;
};

type BackendHotelDto = {
  id: string;
  name?: string | null;
  address?: string | null;
  description?: string | null;
  isApproved?: boolean | null;
  ownerId?: string | null;
  images?: BackendHotelImage[] | null;
  amenities?: BackendHotelAmenity[] | null;
};

type BackendHotelDetailDto = BackendHotelDto & {
  averageRating?: number;
  rooms?: unknown[];
  reviews?: unknown[];
};

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd');
};

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  'ha noi': { lat: 21.0285, lng: 105.8542 },
  'da nang': { lat: 16.0544, lng: 108.2022 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
  'sai gon': { lat: 10.8231, lng: 106.6297 },
  sapa: { lat: 22.3364, lng: 103.8438 },
  'gan cho toi': { lat: 21.0285, lng: 105.8542 },
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateHotelFinalPrice = (hotel: any) => {
  const priceAfterDiscount = hotel.basePrice * (1 - hotel.discountPercent / 100);

  let voucherAmount = 0;

  if (hotel.voucher && priceAfterDiscount >= hotel.voucher.minPrice) {
    if (hotel.voucher.discountType === 'percent') {
      voucherAmount = Math.min(
        priceAfterDiscount * (hotel.voucher.discountValue / 100),
        hotel.voucher.maxDiscount || Infinity
      );
    } else {
      voucherAmount = hotel.voucher.discountValue;
    }
  }

  return Math.max(0, priceAfterDiscount - voucherAmount);
};

const getDefaultImage = () => {
  return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
};

const mapBackendHotelToSearchResult = (hotel: BackendHotelDto): HotelSearchResult => {
  const imageFromApi = hotel.images?.[0]?.url;

  return {
    id: hotel.id,
    name: hotel.name || 'Khách sạn chưa có tên',
    address: hotel.address || 'Chưa có địa chỉ',
    image: imageFromApi || getDefaultImage(),
    rating: 8.5,
    reviewCount: 0,
    star: 4,
    basePrice: 500000,
    discountPercent: 0,
    availableRooms: 0,
    amenities: hotel.amenities?.map(item => item.name || '').filter(Boolean) || [],
    badges: hotel.isApproved ? ['Đã duyệt'] : ['Chờ duyệt'],
    voucher: undefined,
    lat: 21.0285,
    lng: 105.8542,
    type: 'Khách sạn',
  };
};

const filterAndSortHotels = (
  hotels: HotelSearchResult[],
  params: HotelSearchParams
): HotelSearchResult[] => {
  const originalLocation = params.location || '';
  const normalizedSearch = normalizeString(originalLocation);

  let center = CITY_CENTERS[normalizedSearch];

  if (!center) {
    const foundKey = Object.keys(CITY_CENTERS).find(key => normalizedSearch.includes(key));
    if (foundKey) center = CITY_CENTERS[foundKey];
  }

  const referenceCenter = center || CITY_CENTERS['ha noi'];

  let results = hotels
    .map(hotel => {
      const distance = getDistance(referenceCenter.lat, referenceCenter.lng, hotel.lat, hotel.lng);
      const finalPrice = calculateHotelFinalPrice(hotel);

      return {
        ...hotel,
        distance,
        calculatedFinalPrice: finalPrice,
      };
    })
    .filter((hotel: any) => {
      const hotelNameNorm = normalizeString(hotel.name);
      const hotelAddressNorm = normalizeString(hotel.address);

      const matchesText =
        !normalizedSearch ||
        hotelNameNorm.includes(normalizedSearch) ||
        hotelAddressNorm.includes(normalizedSearch) ||
        hotel.distance <= 50;

      const matchesPrice =
        (!params.minPrice || hotel.calculatedFinalPrice >= params.minPrice) &&
        (!params.maxPrice || hotel.calculatedFinalPrice <= params.maxPrice);

      return matchesText && matchesPrice;
    });

  switch (params.sortBy) {
    case 'price_low':
      results.sort((a: any, b: any) => a.calculatedFinalPrice - b.calculatedFinalPrice);
      break;
    case 'price_high':
      results.sort((a: any, b: any) => b.calculatedFinalPrice - a.calculatedFinalPrice);
      break;
    case 'distance':
      results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      break;
    case 'star_high':
      results.sort((a, b) => b.star - a.star);
      break;
    case 'reviews':
      results.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return results;
};

export const hotelService = {
  searchHotels: async (params: HotelSearchParams): Promise<HotelSearchResult[]> => {
    try {
      const backendHotels = await apiGet<BackendHotelDto[]>('/hotel');

      const mappedHotels = backendHotels.map(mapBackendHotelToSearchResult);

      return filterAndSortHotels(mappedHotels, params);
    } catch (error) {
      console.warn('Không gọi được API /hotel, tạm dùng fakeHotels:', error);

      const fallbackHotels = fakeHotels as HotelSearchResult[];

      return filterAndSortHotels(fallbackHotels, params);
    }
  },

  getHotelDetail: async (id: string | number): Promise<HotelDetail> => {
    try {
      const backendHotel = await apiGet<BackendHotelDetailDto>(`/hotel/${id}`);

      const mappedHotel = mapBackendHotelToSearchResult(backendHotel);

      return {
        ...mappedHotel,
        description: backendHotel.description || 'Chưa có mô tả khách sạn.',
        images: backendHotel.images?.map(image => image.url || '').filter(Boolean) || [
          getDefaultImage(),
        ],
        ratingText: 'Rất tốt',
        highlights: ['Vị trí thuận tiện', 'Dịch vụ tốt'],
        topAmenities:
          backendHotel.amenities?.map(item => item.name || '').filter(Boolean) || [],
        reviews: [],
        locationScore: 8.5,
        nearbyPlaces: [],
        usefulInfo: {
          checkInFrom: '14:00',
          checkOutUntil: '12:00',
          receptionOpenUntil: '22:00',
          distanceFromCityCenter: '1 km',
          airportTransferTime: '30 phút',
          airportTransferFee: 0,
          dailyInternetFee: 0,
          breakfastFee: 0,
        },
        languages: ['Tiếng Việt'],
        policies: [],
      };
    } catch (error) {
      console.warn(`Không gọi được API /hotel/${id}, tạm dùng fakeHotels:`, error);

      const hotel = fakeHotels.find(h => h.id.toString() === id.toString());

      if (!hotel) {
        throw new Error('Không tìm thấy khách sạn');
      }

      return hotel as HotelDetail;
    }
  },
};