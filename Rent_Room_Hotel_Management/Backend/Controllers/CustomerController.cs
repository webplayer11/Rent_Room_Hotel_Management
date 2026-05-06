using Microsoft.AspNetCore.Mvc;
using RoomManagement.DTOs;
using RoomManagement.Services.Interfaces;

namespace RoomManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _service;

        public CustomerController(ICustomerService service) => _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAll()
            => Ok(new ApiResponse<IEnumerable<CustomerDto>>(true, null, await _service.GetAllAsync()));

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _service.GetByIdAsync(id);
            return result is null
                ? NotFound(new ApiResponse<CustomerDto>(false, "Không tìm thấy khách hàng.", null))
                : Ok(new ApiResponse<CustomerDto>(true, null, result));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id },
                new ApiResponse<CustomerDto>(true, "Tạo khách hàng thành công.", result));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateCustomerDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            return result is null
                ? NotFound(new ApiResponse<CustomerDto>(false, "Không tìm thấy khách hàng.", null))
                : Ok(new ApiResponse<CustomerDto>(true, "Cập nhật thành công.", result));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            return success
                ? Ok(new ApiResponse<object>(true, "Xóa thành công.", null))
                : NotFound(new ApiResponse<object>(false, "Không tìm thấy khách hàng.", null));
        }
    }
}