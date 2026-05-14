using System.Text.Json.Serialization;

namespace RoomManagement.DTOs;

public class ResponseApi<T>
{
    [JsonPropertyName("isSuccess")]
    public bool IsSuccess { get; set; }

    [JsonPropertyName("code")]
    public int Code { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    // Constructor cho success response
    public static ResponseApi<T> Success(T data, string message = "Success", int code = 200)
    {
        return new ResponseApi<T>
        {
            IsSuccess = true,
            Code = code,
            Message = message,
            Data = data
        };
    }

    // Constructor cho failure response
    public static ResponseApi<T> Failure(int code, string message = "An error occurred", T? data = default)
    {
        return new ResponseApi<T>
        {
            IsSuccess = false,
            Code = code,
            Message = message,
            Data = data
        };
    }
}
