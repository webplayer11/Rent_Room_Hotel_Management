using RoomManagement.DTOs;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Services.Implementations
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repo;

        public CustomerService(ICustomerRepository repo) => _repo = repo;

        public async Task<IEnumerable<CustomerDto>> GetAllAsync()
            => (await _repo.GetAllAsync()).Select(MapToDto);

        public async Task<CustomerDto?> GetByIdAsync(string id)
        {
            var c = await _repo.GetByIdAsync(id);
            return c is null ? null : MapToDto(c);
        }

        public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
        {
            var entity = new Customer
            {
                Id = dto.Id,
                AccountId = dto.AccountId,
                Name = dto.Name,
                Phone = dto.Phone,
                Address = dto.Address,
                IdentityDoc = dto.IdentityDoc
            };
            return MapToDto(await _repo.CreateAsync(entity));
        }

        public async Task<CustomerDto?> UpdateAsync(string id, UpdateCustomerDto dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity is null) return null;

            entity.Name = dto.Name ?? entity.Name;
            entity.Phone = dto.Phone ?? entity.Phone;
            entity.Address = dto.Address ?? entity.Address;
            entity.IdentityDoc = dto.IdentityDoc ?? entity.IdentityDoc;

            return MapToDto(await _repo.UpdateAsync(entity));
        }

        public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);

        private static CustomerDto MapToDto(Customer c) =>
            new(c.Id, c.AccountId, c.Name, c.Phone, c.Address, c.IdentityDoc);
    }
}