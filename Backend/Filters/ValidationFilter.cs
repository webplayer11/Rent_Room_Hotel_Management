using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using RoomManagement.DTOs;

namespace RoomManagement.Filters
{
    /// <summary>
    /// Tự động trả 400 Bad Request với danh sách lỗi validation
    /// khi ModelState không hợp lệ — không cần check trong từng Controller.
    /// </summary>
    public class ValidationFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var errors = context.ModelState
                    .Where(e => e.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                var response = ResponseApi<Dictionary<string, string[]>>.Failure(
                    code: 400,
                    message: "Dữ liệu đầu vào không hợp lệ.",
                    data: errors
                );

                context.Result = new BadRequestObjectResult(response);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context) { }
    }
}
