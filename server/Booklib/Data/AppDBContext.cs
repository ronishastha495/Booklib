using Microsoft.EntityFrameworkCore;
using Booklib.Models.Entities;

namespace Booklib.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options) : base(options)
        {

        }

         public DbSet<User> User { get; set; }

         public DbSet<Book> Books { get; set; }

         public DbSet<Bookmark> Bookmarks { get; set; }

        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<Discount> Discounts{ get; set; }
    
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure your Book entity
            modelBuilder.Entity<Book>()
                .HasIndex(b => b.ISBN)
                .IsUnique();
                
            // Add configurations for Author as a string property
            modelBuilder.Entity<Book>()
                .Property(b => b.Author)
                .IsRequired()
                .HasMaxLength(100);
        }

        // Add your DbSets here
        // public DbSet<Book> Books { get; set; }
    }
}
