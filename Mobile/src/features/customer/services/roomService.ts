import { fakeRooms } from '../data/fakeRooms';
import { Room, RoomPriceSummary, RoomSearchParams } from '../types/room';

export const roomService = {
  getRoomsByHotelId: async (hotelId: string | number, params: Partial<RoomSearchParams>): Promise<Room[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      // In a real app, this would be a fetch call with params
      const rooms = fakeRooms.filter(r => r.hotelId.toString() === hotelId.toString());
      return rooms;
    } catch (error) {
      console.error('Get Rooms Error:', error);
      throw new Error('Không thể tải danh sách phòng');
    }
  },

  getQuickRoomsByHotelId: async (hotelId: string | number, params: any): Promise<Room[]> => {
    return roomService.getRoomsByHotelId(hotelId, params);
  },

  calculateRoomPrice: (room: Room, nights: number, selectedRoomCount: number): RoomPriceSummary => {
    const totalBasePrice = room.basePrice * nights * selectedRoomCount;
    const discountAmount = totalBasePrice * (room.discountPercent / 100);
    const priceAfterDiscount = totalBasePrice - discountAmount;

    let voucherDiscountAmount = 0;
    if (room.voucher && priceAfterDiscount >= room.voucher.minPrice) {
      if (room.voucher.discountType === 'percent') {
        voucherDiscountAmount = Math.min(priceAfterDiscount * (room.voucher.discountValue / 100), room.voucher.maxDiscount || Infinity);
      } else {
        voucherDiscountAmount = room.voucher.discountValue * selectedRoomCount;
      }
    }

    const finalPrice = Math.max(0, priceAfterDiscount - voucherDiscountAmount);

    return {
      totalBasePrice,
      discountAmount,
      priceAfterDiscount,
      voucherDiscountAmount,
      serviceFee: 0,
      taxFee: 0,
      finalPrice,
    };
  }
};
