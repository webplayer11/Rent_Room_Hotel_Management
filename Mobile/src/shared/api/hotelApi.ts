import { apiFetch } from "./apiClient";

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
  createHotel: async (data: CreateHotelPayload) => {
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
    });
  },

  getMyHotels: async () => {
    return apiFetch("/api/hotels/my-hotels", {
      method: "GET",
    });
  },
};