export interface Hotel {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  location: string;
  tags: string[];
  distance: string;
}

export const hotels: Hotel[] = [
  {
    id: '1',
    name: 'InterContinental Danang Sun Peninsula Resort',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
    rating: 4.8,
    reviews: 1250,
    price: 4500000,
    originalPrice: 6000000,
    location: 'Bán đảo Sơn Trà, Đà Nẵng',
    tags: ['Bữa sáng miễn phí', 'Hồ bơi vô cực'],
    distance: '8.5 km từ trung tâm',
  },
  {
    id: '2',
    name: 'Sofitel Legend Metropole Hanoi',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500',
    rating: 4.9,
    reviews: 2100,
    price: 3200000,
    originalPrice: 4500000,
    location: 'Hoàn Kiếm, Hà Nội',
    tags: ['Lịch sử', 'Sang trọng'],
    distance: '0.2 km từ trung tâm',
  },
  {
    id: '3',
    name: 'Vinpearl Resort & Spa Phu Quoc',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500',
    rating: 4.7,
    reviews: 3400,
    price: 2100000,
    originalPrice: 3000000,
    location: 'Gành Dầu, Phú Quốc',
    tags: ['Gần biển', 'Gia đình'],
    distance: '15 km từ sân bay',
  },
  {
    id: '4',
    name: 'Fusion Maia Da Nang',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
    rating: 4.6,
    reviews: 890,
    price: 3800000,
    originalPrice: 5200000,
    location: 'Ngũ Hành Sơn, Đà Nẵng',
    tags: ['Spa trọn gói', 'Villa'],
    distance: '5 km từ trung tâm',
  },
];
