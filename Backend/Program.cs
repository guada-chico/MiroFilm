using Miro.Data;
using Miro.Services;
using Miro.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using Miro.Services.Swagger;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CONFIGURACIÓN DE LA BASE DE DATOS ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// --- 2. REGISTRO DE TUS 8 SERVICIOS (Dependency Injection) ---
// Registramos cada interfaz con su clase según tu estructura de carpetas
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IFavoritesService, FavoritesService>();
builder.Services.AddScoped<IFriendshipService, FriendshipService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IReadingService, ReadingService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddScoped<ISeriesService, SeriesService>();

// OpenAI AI service
builder.Services.AddHttpClient<Miro.Services.Interfaces.IAIService, Miro.Services.OpenAIService>();

// Registro especial para APIS externas que usan HttpClient
builder.Services.AddHttpClient<IGoogleBookService, GoogleBookService>();
builder.Services.AddHttpClient<IOpenLibraryService, OpenLibraryService>();
builder.Services.AddHttpClient<INytBooksService, NytBooksService>();
builder.Services.AddHttpClient<IPrhBooksService, PrhBooksService>();
builder.Services.AddHttpClient<ITmdbService, TmdbService>();

// --- 3. CONFIGURACIÓN DE SEGURIDAD (JWT) ---
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ClaveSuperSecretaDeMiroProyecto2024!";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

// --- 4. CORS (Para que React no sea bloqueado) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddEndpointsApiExplorer();

// --- 5. CONFIGURACIÓN DE SWAGGER ---
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Miro API", Version = "v1" });

    // Configuración para poder pegar el Token en Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Escribe 'Bearer ' seguido de tu token JWT."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
    c.OperationFilter<FormFileOperationFilter>();
    // Aquí se puede agregar el operation filter para manejo de IFormFile
});

var app = builder.Build();

// --- 6. PIPELINE DE MIDDLEWARE (El orden importa) ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Servir archivos estáticos (para avatares)
app.UseStaticFiles();

// IMPORTANTE: CORS siempre antes de Auth
app.UseCors("AllowReact");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();