using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Booklib.Models.Entities;
using Booklib.DTOs;
using Booklib.Helpers;
using Booklib.Data;
using System.Security.Cryptography;
using System.Text;

namespace Booklib.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly JwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AppDBContext context, JwtService jwtService, ILogger<AuthController> logger)
        {
            _context = context;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
            if (dto.Password != dto.ConfirmPassword)
            {
                _logger.LogWarning("Password mismatch for registration attempt: {Email}", dto.Email);
                return BadRequest("Password and confirm password do not match.");
            }

            if (await _context.User.AnyAsync(u => u.Email == dto.Email))
            {
                _logger.LogWarning("Attempted duplicate registration: {Email}", dto.Email);
                return BadRequest("Email is already registered.");
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = HashPassword(dto.Password)
            };

            _context.User.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User registered: {Email}", user.Email);
            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(UserLoginDto dto)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
            {
                _logger.LogWarning("Invalid login attempt for: {Email}", dto.Email);
                return Unauthorized("Invalid credentials.");
            }

            var tokenExpiration = default(DateTime);
            var refreshExpiration = DateTime.UtcNow.AddDays(7);

            var accessToken = _jwtService.GenerateToken(user, out tokenExpiration);
            var refreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpires = refreshExpiration;
            await _context.SaveChangesAsync();

            _logger.LogInformation("User logged in: {Email}", user.Email);
            return Ok(new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                Expiration = tokenExpiration
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            var user = await _context.User.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
            if (user == null || user.RefreshTokenExpires < DateTime.UtcNow)
            {
                _logger.LogWarning("Invalid or expired refresh token used.");
                return Unauthorized("Invalid or expired refresh token.");
            }

            var tokenExpiration = default(DateTime);
            var accessToken = _jwtService.GenerateToken(user, out tokenExpiration);

            _logger.LogInformation("Refresh token used for user: {Email}", user.Email);
            return Ok(new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                Expiration = tokenExpiration
            });
        }

        // --- Helper Methods ---

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string input, string hashed)
        {
            return HashPassword(input) == hashed;
        }
    }
}
