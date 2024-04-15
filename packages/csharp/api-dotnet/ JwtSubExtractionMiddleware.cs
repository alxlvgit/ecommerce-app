using System.IdentityModel.Tokens.Jwt;

public class JwtSubExtractionMiddleware
{
    private readonly RequestDelegate _next;

    public JwtSubExtractionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            var token = authHeader.ToString().Split(' ').Last();
            var handler = new JwtSecurityTokenHandler();
            try
            {
                var jwtToken = handler.ReadJwtToken(token);
                var subClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "sub")?.Value;

                if (subClaim != null)
                {
                    // Store the 'sub' claim for use in subsequent steps
                    context.Items["sub"] = subClaim;
                }
            }
            catch (ArgumentException)
            {
                // Token is malformed
            }
        }

        // Call the next delegate/middleware in the pipeline
        await _next(context);
    }
}

