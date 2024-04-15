using Microsoft.EntityFrameworkCore;

namespace SignalrApp.Models;

public class DatabaseContext : DbContext
{
  public DatabaseContext(DbContextOptions<DatabaseContext> options)
    : base(options) { }

  public DbSet<ShoppingCart> ShoppingCarts { get; set; }
}