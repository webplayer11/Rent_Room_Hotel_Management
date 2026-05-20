import { apiFetch } from "./apiClient";

export type ApiResponse<T> = {
  isSuccess: boolean;
  code: number;
  message: string;
  data: T;
};

export type HotelImageDto = {
  id: string;
  url?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type HotelDto = {
  id: string;
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  isActive: boolean;
  isApproved: boolean;
  hostId: string;
  images: HotelImageDto[];
};

export type CreateHotelPayload = {
  name: string;
  description: string;
  address: string;
  starRating?: number;
  checkInTime: string;
  checkOutTime: string;
  images: any[];
};

export const hotelApi = {
  createHotel: (data: CreateHotelPayload) => {
    const formData = new FormData();

    formData.append("Name", data.name);
    formData.append("Description", data.description);
    formData.append("Address", data.address);
    if (data.starRating !== undefined) { formData.append("StarRating", String(data.starRating)); }
    formData.append("CheckInTime", data.checkInTime);
    formData.append("CheckOutTime", data.checkOutTime);
    data.images.forEach((image, index) => {
      formData.append("Images", {
        uri: image.uri,
        name: image.fileName || `hotel_${index}.jpg`,
        type: image.mimeType || "image/jpeg",
      } as any);
    });

    return apiFetch("/api/hotels", {
      method: "POST",
      body: formData,
      isFormData: true,
    }) as Promise<ApiResponse<HotelDto>>;
  },

  getMyHotels: () => {
    return apiFetch("/api/hotels/my-hotels", {
      method: "GET",
    }) as Promise<ApiResponse<HotelDto[]>>;
  },

  getHotelById: (id: string) => {
    return apiFetch(`/api/hotels/${id}`, {
      method: "GET",
    }) as Promise<ApiResponse<HotelDto>>;
  },
};