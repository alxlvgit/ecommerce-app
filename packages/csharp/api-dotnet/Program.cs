using SignalrApp.Models;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

DotNetEnv.Env.Load();
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING");
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
builder.Services.AddDbContext<DatabaseContext>(options => options.UseNpgsql(connectionString));
var app = builder.Build();

app.MapGet("/carts", async (DatabaseContext dbContext) =>
{
    var carts = await dbContext.ShoppingCarts.ToListAsync();
    return Results.Ok(carts);
}); 

app.MapGet ("/cart/{userId}", async (DatabaseContext dbContext, int userId) =>
{
    var cart = await dbContext.ShoppingCarts.FirstOrDefaultAsync(c => c.user_id == userId.ToString());
    if (cart == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(cart);
});

app.MapPost("/cart", async (DatabaseContext dbContext, ShoppingCart cart) =>
{
    await dbContext.ShoppingCarts.AddAsync(cart);
    await dbContext.SaveChangesAsync();
    return Results.Created($"/cart/{cart.id}", cart);
});

app.Run();
