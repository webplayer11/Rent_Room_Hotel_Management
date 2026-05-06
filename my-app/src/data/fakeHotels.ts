import { HotelDetail } from '../types/hotel';

export const fakeHotels: HotelDetail[] = [
  {
    id: 1,
    name: "Sun Hotel Hà Nội",
    address: "Số 123, Phố Liễu Giai, Quận Đống Đa, Hà Nội",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
    ],
    rating: 4.8,
    ratingText: "Tuyệt vời",
    reviewCount: 320,
    star: 4,
    basePrice: 1200000,
    discountPercent: 15,
    availableRooms: 3,
    amenities: ["Wifi", "Bể bơi", "Bãi đỗ xe"],
    badges: ["Mới xây dựng", "Agoda Preferred", "Eco Deals"],
    voucher: {
      id: "v1",
      code: "AGODAVN",
      title: "Giảm 50k cho khách mới",
      discountType: "fixed",
      discountValue: 50000,
      minPrice: 500000
    },
    lat: 21.0285,
    lng: 105.8542,
    type: "Khách sạn cao cấp",
    description: "Sun Hotel Hà Nội tọa lạc tại vị trí đắc địa quận Đống Đa, mang đến không gian nghỉ dưỡng sang trọng và tiện nghi hiện đại cho du khách.",
    highlights: ["Sạch bóng", "Đáng tiền nhất", "Nhận phòng 24 giờ", "Chất lượng tuyệt vời"],
    topAmenities: ["Miễn phí Wi-Fi", "Đỗ xe miễn phí", "Spa", "Bàn tiếp tân 24 giờ", "Nhà hàng"],
    reviews: [
      { id: "rev1", content: "Phòng rất sạch sẽ và nhân viên thân thiện. Tôi sẽ quay lại!", userName: "Minh Quân", country: "Việt Nam", rating: 9, date: "2024-05-01" },
      { id: "rev2", content: "Vị trí tuyệt vời, gần nhiều quán ăn ngon.", userName: "Sarah", country: "Australia", rating: 8.5, date: "2024-04-20" }
    ],
    locationScore: 8.9,
    nearbyPlaces: [
      { id: "n1", name: "Bảo Tàng Dân Tộc Học", distance: "3.92 km", type: "landmark" },
      { id: "n2", name: "Văn Miếu", distance: "4.31 km", type: "landmark" },
      { id: "n3", name: "Chùa Một Cột", distance: "4.64 km", type: "landmark" }
    ],
    usefulInfo: {
      checkInFrom: "14:00",
      checkOutUntil: "12:00",
      receptionOpenUntil: "23:59",
      distanceFromCityCenter: "5 km",
      airportTransferTime: "30 phút",
      airportTransferFee: 300000,
      dailyInternetFee: 0,
      breakfastFee: 100000
    },
    languages: ["Tiếng Việt", "Tiếng Anh", "Tiếng Nhật"],
    policies: [
      { title: "Trẻ em và giường phụ", content: "Lưu trú miễn phí nếu sử dụng giường có sẵn cho trẻ em dưới 6 tuổi." }
    ]
  },
  {
    id: 2,
    name: "Golden Palace Hotel",
    address: "Số 45, Phố Hàng Gai, Quận Hoàn Kiếm, Hà Nội",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    images: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
    ],
    rating: 4.6,
    ratingText: "Tuyệt vời",
    reviewCount: 210,
    star: 5,
    basePrice: 1500000,
    discountPercent: 0,
    availableRooms: 5,
    amenities: ["Wifi", "Ăn sáng", "View đẹp"],
    badges: ["Agoda Preferred", "Ưu đãi VIP"],
    lat: 21.0278,
    lng: 105.8523,
    type: "Khách sạn",
    description: "Golden Palace Hotel mang phong cách kiến trúc cổ điển giữa lòng phố cổ Hà Nội, cung cấp dịch vụ đẳng cấp 5 sao.",
    highlights: ["Vị trí đắc địa", "Phòng rộng rãi", "Ăn sáng ngon"],
    topAmenities: ["Miễn phí Wi-Fi", "Nhà hàng", "Tour du lịch"],
    reviews: [],
    locationScore: 9.5,
    nearbyPlaces: [],
    usefulInfo: {
      checkInFrom: "14:00",
      checkOutUntil: "12:00",
      receptionOpenUntil: "24:00",
      distanceFromCityCenter: "0.5 km",
      airportTransferTime: "45 phút",
      airportTransferFee: 400000,
      dailyInternetFee: 0,
      breakfastFee: 200000
    },
    languages: ["Tiếng Việt", "Tiếng Anh"],
    policies: []
  },
  {
    id: 3,
    name: "Ocean View Đà Nẵng",
    address: "Số 88, Đường Võ Nguyên Giáp, Phường Mỹ Khê, Quận Ngũ Hành Sơn, Đà Nẵng",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"],
    rating: 4.9,
    ratingText: "Trên cả tuyệt vời",
    reviewCount: 510,
    star: 5,
    basePrice: 2000000,
    discountPercent: 25,
    availableRooms: 2,
    amenities: ["Gần biển", "Bể bơi", "Wifi"],
    badges: ["Agoda Preferred", "Ưu đãi VIP"],
    voucher: {
      id: "v3",
      code: "BEACH2026",
      title: "Giảm 200k cho kỳ nghỉ dài",
      discountType: "fixed",
      discountValue: 200000,
      minPrice: 3000000
    },
    lat: 16.0544,
    lng: 108.2022,
    type: "Biệt thự",
    description: "Ocean View Đà Nẵng là khu biệt thự nghỉ dưỡng cao cấp nằm sát bãi biển Mỹ Khê xinh đẹp.",
    highlights: ["Sát biển", "Bể bơi vô cực", "Không gian riêng tư"],
    topAmenities: ["Bể bơi", "Spa", "Nhà hàng hải sản"],
    reviews: [],
    locationScore: 9.8,
    nearbyPlaces: [],
    usefulInfo: {
      checkInFrom: "14:00",
      checkOutUntil: "12:00",
      receptionOpenUntil: "24:00",
      distanceFromCityCenter: "3 km",
      airportTransferTime: "15 phút",
      airportTransferFee: 150000,
      dailyInternetFee: 0,
      breakfastFee: 0
    },
    languages: ["Tiếng Việt", "Tiếng Anh", "Tiếng Trung"],
    policies: []
  }
];
