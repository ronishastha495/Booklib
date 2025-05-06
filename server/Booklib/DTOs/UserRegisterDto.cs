namespace Booklib.DTOs
{
    public class UserRegisterDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string ConfirmPassword { get; set; }
    }

    public class UserLoginDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class AuthResponseDto
    {
        public required string Token { get; set; }
        public required string RefreshToken { get; set; }
        public DateTime Expiration { get; set; }
    }
}
