using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IHotelAmenityRepository : IGenericRepository<HotelAmenity>
    {
        Task<IEnumerable<HotelAmenity>> GetByHotelIdAsync(string hotelId);
    }
}