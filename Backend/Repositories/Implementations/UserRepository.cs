using Microsoft.AspNetCore.Identity;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;

namespace RoomManagement.Repositories.Implementations;

public class UserRepository : IUserRepository
{
    private readonly UserManager<ApplicationUser> _userManager;
    
    public UserRepository(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public Task<ApplicationUser?> FindByEmailAsync(string email)
    {
        throw new NotImplementedException();
    }

    public async Task<IdentityResult> CreateAsync(ApplicationUser user, string password)
    {
        return await _userManager.CreateAsync(user, password);
    }

    public Task<bool> CheckPasswordAsync(ApplicationUser user, string password)
    {
        throw new NotImplementedException();
    }

    public Task<IList<string>> GetRolesAsync(ApplicationUser user)
    {
        throw new NotImplementedException();
    }

    public Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role)
    {
        throw new NotImplementedException();
    }

    public Task<ApplicationUser?> FindByIdAsync(string userId)
    {
        throw new NotImplementedException();
    }

    public Task<IdentityResult> UpdateAsync(ApplicationUser user)
    {
        throw new NotImplementedException();
    }

    public Task<IdentityResult> ChangePasswordAsync(ApplicationUser user, string currentPassword, string newPassword)
    {
        throw new NotImplementedException();
    }
}