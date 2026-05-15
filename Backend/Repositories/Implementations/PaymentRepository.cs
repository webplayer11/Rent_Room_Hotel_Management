using Microsoft.EntityFrameworkCore;
using RoomManagement.Data;
using RoomManagement.Models;
using RoomManagement.Repositories.Interfaces;

namespace RoomManagement.Repositories.Implementations;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Payment>> GetByBookingIdAsync(string bookingId)
    {
        return await _context.Payments
            .Where(p => p.BookingId == bookingId)
            .OrderByDescending(p => p.PaidAt ?? DateTime.MaxValue)
            .ToListAsync();
    }

    public async Task<Payment?> GetByIdAsync(string id)
    {
        return await _context.Payments
            .Include(p => p.Booking)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment> CreateAsync(Payment payment)
    {
        payment.Id = Guid.NewGuid().ToString();
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task<Payment> UpdateAsync(Payment payment)
    {
        _context.Payments.Update(payment);
        await _context.SaveChangesAsync();
        return payment;
    }
    
    
    

    public async Task<bool> UpdateStatusAsync(string paymentBuild)
    {
        var payment =  await _context.Payments.FirstOrDefaultAsync(p => p.TransactionId == paymentBuild);
        if (payment == null)
        {
            return false;
        }
        payment.Status = "SUCCESS";
        _context.Payments.Update(payment);
        await _context.SaveChangesAsync();
        return true;
    }
}
