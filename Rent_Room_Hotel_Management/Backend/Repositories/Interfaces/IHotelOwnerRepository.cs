using RoomManagement.Models;

namespace RoomManagement.Repositories.Interfaces
{
    public interface IHotelOwnerRepository : IGenericRepository<HotelOwner>
    {
        Task<HotelOwner?> GetWithHotelsAsync(string id);
        Task<HotelOwner?> GetByAccountIdAsync(string accountId);
    }
}