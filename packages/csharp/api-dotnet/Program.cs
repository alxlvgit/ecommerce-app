using AspNetAppApi.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;


var builder = WebApplication.CreateBuilder(args);

DotNetEnv.Env.Load();
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING");
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
builder.Services.AddDbContext<DatabaseContext>(options => options.UseNpgsql(connectionString));
var app = builder.Build();
app.UseMiddleware<JwtSubExtractionMiddleware>();


app.MapGet("/carts", async (DatabaseContext dbContext, HttpContext httpContext) =>
{
  var sub = httpContext.Items["sub"] as string;
  if (sub == null)
  {
    return Results.Json(new { message = "Unauthorized access" });
  }
    var carts = await dbContext.ShoppingCarts.ToListAsync();
    return Results.Ok(carts);
}); 

app.MapGet ("/cart/{userId}", async (DatabaseContext dbContext, string userId, HttpContext httpContext) =>
{
  var sub = httpContext.Items["sub"] as string;
  if (sub == null)
  {
    return Results.Json(new { message = "Unauthorized access" });
  }
    var shoppingCart = await dbContext.ShoppingCarts.FirstOrDefaultAsync(c => c.user_id == userId);
    if (shoppingCart == null)
    {
        return Results.Json(new { message = "Cart not found" });
    }
    return Results.Json( new { cart = shoppingCart });
});


app.MapPost("/cart", async (DatabaseContext dbContext, ShoppingCart cart, HttpContext httpContext) =>
{
  var sub = httpContext.Items["sub"] as string;
  if (sub == null)
  {
    return Results.Json(new { message = "Unauthorized access" });
  }
    await dbContext.ShoppingCarts.AddAsync(cart);
    await dbContext.SaveChangesAsync();
    return Results.Created($"/cart/{cart.id}", cart);
});

app.Run();
