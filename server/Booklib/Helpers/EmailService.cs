using System;
using Booklib.DTOs.Response;
using MailKit.Net.Smtp;
using MimeKit;

namespace Booklib.Helpers;

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task SendOrderConfirmationEmail(string toEmail, OrderResponseDTO order)
    {
        try
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("Recipient email cannot be null or empty", nameof(toEmail));

            if (order == null)
                throw new ArgumentNullException(nameof(order));

            // Get configuration values
            var emailSettings = _configuration.GetSection("EmailSettings");
            var fromEmail = emailSettings["FromEmail"] 
                ?? throw new InvalidOperationException("FromEmail configuration is missing");
            var smtpServer = emailSettings["SmtpServer"] 
                ?? throw new InvalidOperationException("SmtpServer configuration is missing");
            if (!int.TryParse(emailSettings["SmtpPort"], out var smtpPort))
                throw new InvalidOperationException("Invalid SmtpPort configuration");
            var password = emailSettings["Password"] 
                ?? throw new InvalidOperationException("Email password is missing");

            // Create email message
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(fromEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = $"Order Confirmation - Claim Code: {order.ClaimCode}";

            // Build email body
            var builder = new BodyBuilder();
            builder.HtmlBody = GenerateOrderEmailBody(order);
            email.Body = builder.ToMessageBody();

            // Send email
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpServer, smtpPort, true);
            await smtp.AuthenticateAsync(fromEmail, password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("Order confirmation email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send order confirmation email to {Email}", toEmail);
            throw new InvalidOperationException("Failed to send order confirmation email", ex);
        }
    }

    private string GenerateOrderEmailBody(OrderResponseDTO order)
    {
        var itemsList = string.Join("\n", order.Items.Select(item =>
            $"<tr>" +
            $"<td style='padding: 8px; border: 1px solid #ddd;'>{item.BookTitle}</td>" +
            $"<td style='padding: 8px; border: 1px solid #ddd;'>{item.Quantity}</td>" +
            $"<td style='padding: 8px; border: 1px solid #ddd;'>${item.UnitPrice:F2}</td>" +
            $"<td style='padding: 8px; border: 1px solid #ddd;'>${item.Subtotal:F2}</td>" +
            "</tr>"
        ));

        return $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h2>Order Confirmation</h2>
                <div style='background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;'>
                    <h3 style='color: #dc3545;'>Claim Code: {order.ClaimCode}</h3>
                    <p>Please present this code when collecting your books</p>
                </div>

                <div style='margin: 20px 0;'>
                    <h4>Order Details:</h4>
                    <p>Order ID: {order.OrderId}</p>
                    <p>Order Date: {order.CreatedAt:g}</p>
                    <p>Status: {order.Status}</p>
                </div>

                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                    <thead>
                        <tr style='background-color: #f8f9fa;'>
                            <th style='padding: 8px; border: 1px solid #ddd;'>Book</th>
                            <th style='padding: 8px; border: 1px solid #ddd;'>Quantity</th>
                            <th style='padding: 8px; border: 1px solid #ddd;'>Unit Price</th>
                            <th style='padding: 8px; border: 1px solid #ddd;'>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsList}
                    </tbody>
                </table>

                <div style='margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;'>
                    <p><strong>Subtotal:</strong> ${order.SubTotal:F2}</p>
                    <p><strong>Discount:</strong> {order.DiscountPercentage}%</p>
                    <p style='font-size: 1.2em; color: #28a745;'><strong>Final Total:</strong> ${order.FinalTotal:F2}</p>
                </div>
            </div>";
    }
}