using AutoMapper;
using RoomManagement.DTOs;
using RoomManagement.Models;

namespace RoomManagement.Profiles;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<HotelImage, HotelImageDto>();
        CreateMap<RoomImage, RoomImageDto>();
        CreateMap<Room, RoomDto>();
        CreateMap<Amenity, AmenityDto>();
        CreateMap<RoomAmenity, RoomAmenityDto>();
        
        CreateMap<Hotel, HotelDto>();
        
        CreateMap<Hotel, SearchHotelResponseDto>()
            .ForMember(dest => dest.AvailableRooms, opt => opt.MapFrom(src => src.Rooms));

        CreateMap<Booking, BookingDto>();
        CreateMap<Payment, PaymentDto>();
        CreateMap<Voucher, VoucherDto>();

        CreateMap<HostProfile, HostProfileDto>()
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User != null ? src.User.Email : null))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null))
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.User != null ? src.User.PhoneNumber : null));
    }
}
