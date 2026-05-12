import { fakeHotels } from '../data/fakeHotels';
import { HotelSearchParams, HotelSearchResult, HotelDetail } from '../types/hotel';

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd');
};

const CITY_CENTERS: Record<string, { lat: number, lng: number }> = {
  'ha noi': { lat: 21.0285, lng: 105.8542 },
  'da nang': { lat: 16.0544, lng: 108.2022 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
  'sai gon': { lat: 10.8231, lng: 106.6297 },
  'sapa': { lat: 22.3364, lng: 103.8438 },
  'gan cho toi': { lat: 21.0285, lng: 105.8542 },
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateHotelFinalPrice = (hotel: any) => {
  const priceAfterDiscount = hotel.basePrice * (1 - hotel.discountPercent / 100);
  let voucherAmount = 0;
  if (hotel.voucher && priceAfterDiscount >= hotel.voucher.minPrice) {
    if (hotel.voucher.discountType === 'percent') {
      voucherAmount = Math.min(priceAfterDiscount * (hotel.voucher.discountValue / 100), hotel.voucher.maxDiscount || Infinity);
    } else {
      voucherAmount = hotel.voucher.discountValue;
    }
  }
  return Math.max(0, priceAfterDiscount - voucherAmount);
};

export const hotelService = {
  searchHotels: async (params: HotelSearchParams): Promise<HotelSearchResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const originalLocation = params.location || '';
      const normalizedSearch = normalizeString(originalLocation);
      let center = CITY_CENTERS[normalizedSearch];
      if (!center) {
        const foundKey = Object.keys(CITY_CENTERS).find(key => normalizedSearch.includes(key));
        if (foundKey) center = CITY_CENTERS[foundKey];
      }
      const referenceCenter = center || CITY_CENTERS['ha noi'];

      let results = (fakeHotels as any[])
        .map(hotel => {
          const distance = getDistance(referenceCenter.lat, referenceCenter.lng, hotel.lat, hotel.lng);
          const finalPrice = calculateHotelFinalPrice(hotel);
          return { ...hotel, distance, calculatedFinalPrice: finalPrice };
        })
        .filter(hotel => {
          const isNearby = hotel.distance !== undefined && hotel.distance <= 50;
          const hotelNameNorm = normalizeString(hotel.name);
          const matchesPrice = 
            (!params.minPrice || hotel.calculatedFinalPrice >= params.minPrice) &&
            (!params.maxPrice || hotel.calculatedFinalPrice <= params.maxPrice);
          return (isNearby || hotelNameNorm.includes(normalizedSearch)) && matchesPrice;
        });

      // Sorting Logic
      switch (params.sortBy) {
        case 'price_low':
          results.sort((a, b) => a.calculatedFinalPrice - b.calculatedFinalPrice);
          break;
        case 'price_high':
          results.sort((a, b) => b.calculatedFinalPrice - a.calculatedFinalPrice);
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
    } catch (error) {
      throw new Error('Không thể tải danh sách khách sạn');
    }
  },

  getHotelDetail: async (id: string | number): Promise<HotelDetail> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    try {
      const hotel = fakeHotels.find(h => h.id.toString() === id.toString());
      if (!hotel) throw new Error('Không tìm thấy khách sạn');
      return hotel as HotelDetail;
    } catch (error) {
      throw new Error('Không thể tải thông tin khách sạn');
    }
  }
};
