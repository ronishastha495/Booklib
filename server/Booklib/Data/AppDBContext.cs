using Microsoft.EntityFrameworkCore;
using Booklib.Models.Entities;

namespace Booklib.Data
{
    public class AppDBContext(DbContextOptions<AppDBContext> options) : DbContext(options)
    {
        public DbSet<User> User { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Notification> Notifications { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Book Configuration
            modelBuilder.Entity<Book>()
                .HasIndex(b => b.ISBN)
                .IsUnique();

            modelBuilder.Entity<Book>()
                .Property(b => b.Author)
                .IsRequired()
                .HasMaxLength(100);

            // Cart Configuration
            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(e => e.CartId);
                entity.HasMany(e => e.Items)
                      .WithOne(e => e.Cart)
                      .HasForeignKey(e => e.CartId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Cart>(entity =>
        {
            entity.Property(e => e.RowVersion)
                .IsRowVersion()
                .IsConcurrencyToken();
        });

        modelBuilder.Entity<CartItem>(entity =>
                    {
                        entity.HasKey(e => e.CartItemId);
                        entity.HasOne(e => e.Book)
                              .WithMany()
                              .HasForeignKey(e => e.BookId)
                              .OnDelete(DeleteBehavior.Restrict);

                        entity.HasOne(e => e.Cart)
                              .WithMany(c => c.Items)
                              .HasForeignKey(e => e.CartId)
                              .OnDelete(DeleteBehavior.Cascade);
                    });

            // OrderItem Configuration
            // modelBuilder.Entity<OrderItem>(entity =>
            // {
            //     entity.HasKey(e => e.OrderItemId);
            //     entity.HasOne(e => e.Book)
            //           .WithMany()
            //           .HasForeignKey(e => e.BookId)
            //           .OnDelete(DeleteBehavior.Restrict);
            // });


        }
    }
}
