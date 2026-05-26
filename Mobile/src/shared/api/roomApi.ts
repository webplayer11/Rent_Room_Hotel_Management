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

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
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
  status?: string;
};


export const roomApi = {
  createRoom: (data: CreateRoomDto) => {
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
    }) as Promise<ApiResponse<RoomDto>>;
  },

  getRoomsByHotelId: (hotelId: string) => {
    return apiFetch(`/api/rooms/hotel/${hotelId}`, {
      method: "GET",
    }) as Promise<ApiResponse<RoomDto[]>>;
  },

  deleteRoom: (id: string) => {
    return apiFetch(`/api/rooms/${id}`, {
      method: "DELETE",
    }) as Promise<ApiResponse<string>>;
  },

  getRoomById: (id: string) => {
    return apiFetch(`/api/rooms/${id}`, {
      method: "GET",
    }) as Promise<ApiResponse<RoomDto>>;
  },

  updateRoom: (id: string, data: Partial<CreateRoomDto>) => {
    return apiFetch(`/api/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }) as Promise<ApiResponse<RoomDto>>;
  },
};
