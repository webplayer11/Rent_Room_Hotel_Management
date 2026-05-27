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
  latitude?: number;
  longitude?: number;
  starRating?: number;
  checkInTime: string;
  checkOutTime: string;
  images: any[];
  amenities?: string[];
};

export const hotelApi = {
  createHotel: (data: CreateHotelPayload) => {
    const formData = new FormData();

    formData.append("Name", data.name);
    formData.append("Description", data.description);
    formData.append("Address", data.address);
    if (data.latitude !== undefined) { formData.append("Latitude", String(data.latitude)); }
    if (data.longitude !== undefined) { formData.append("Longitude", String(data.longitude)); }
    if (data.starRating !== undefined) { formData.append("StarRating", String(data.starRating)); }
    if (data.amenities && data.amenities.length > 0) {
      data.amenities.forEach((name) => formData.append("Amenities", name));
    }
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

  searchHotels: (params: {
    location?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    checkInDate?: string;
    checkOutDate?: string;
    roomCount?: number;
    guestCount?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.location) query.append("Location", params.location);
    if (params.latitude) query.append("Latitude", params.latitude.toString());
    if (params.longitude) query.append("Longitude", params.longitude.toString());
    if (params.radiusKm) query.append("RadiusKm", params.radiusKm.toString());
    if (params.checkInDate) query.append("CheckInDate", params.checkInDate);
    if (params.checkOutDate) query.append("CheckOutDate", params.checkOutDate);
    if (params.roomCount) query.append("RoomCount", params.roomCount.toString());
    if (params.guestCount) query.append("GuestCount", params.guestCount.toString());

    return apiFetch(`/api/hotels/search?${query.toString()}`, {
      method: "GET",
    }) as Promise<ApiResponse<any[]>>;
  },
};