import { apiFetch } from "./apiClient";

export type RoomImageDto = {
  id: string;
  url?: string;
  caption?: string;
  sortOrder: number;
};

export type RoomDto = {
  id: string;
  hotelId?: string;
  roomNumber?: string;
  roomType?: string;
  description?: string;
  capacity: number;
  bedCount: number;
  bedType?: string;
  pricePerNight: number;
  discountPrice?: number;
  roomSize?: number;
  status?: string;
  isSmokingAllowed: boolean;
  isActive: boolean;
  images: RoomImageDto[];
};

export type CreateRoomDto = {
  hotelId: string;
  roomNumber?: string;
  roomType?: string;
  description?: string;
  capacity: number;
  bedCount: number;
  bedType?: string;
  pricePerNight: number;
  discountPrice?: number;
  roomSize?: number;
  isSmokingAllowed: boolean;
  images: any[];
};

export const roomApi = {
  createRoom: async (data: CreateRoomDto) => {
    const formData = new FormData();

    formData.append("HotelId", data.hotelId);
    if (data.roomNumber) formData.append("RoomNumber", data.roomNumber);
    if (data.roomType) formData.append("RoomType", data.roomType);
    if (data.description) formData.append("Description", data.description);
    
    formData.append("Capacity", String(data.capacity));
    formData.append("BedCount", String(data.bedCount));
    if (data.bedType) formData.append("BedType", data.bedType);
    
    formData.append("PricePerNight", String(data.pricePerNight));
    if (data.discountPrice !== undefined) formData.append("DiscountPrice", String(data.discountPrice));
    if (data.roomSize !== undefined) formData.append("RoomSize", String(data.roomSize));
    
    formData.append("IsSmokingAllowed", String(data.isSmokingAllowed));

    data.images.forEach((image, index) => {
      formData.append("Images", {
        uri: image.uri,
        name: image.fileName || `room_${index}.jpg`,
        type: image.mimeType || "image/jpeg",
      } as any);
    });

    return apiFetch("/api/rooms", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },
};
