using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq;
using System.Reflection;

namespace Miro.Services.Swagger
{
    public class FormFileOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var formFileParameters = context.MethodInfo.GetParameters()
                .Where(p => p.ParameterType == typeof(IFormFile)
                         || p.ParameterType == typeof(IFormFile[])
                         || (p.ParameterType.IsGenericType && p.ParameterType.GetGenericTypeDefinition() == typeof(IEnumerable<>) && p.ParameterType.GetGenericArguments()[0] == typeof(IFormFile)))
                .ToList();

            if (!formFileParameters.Any()) return;

            operation.RequestBody ??= new OpenApiRequestBody();

            // Construir schema multipart/form-data con los campos de tipo file
            var mediaType = new OpenApiMediaType
            {
                Schema = new OpenApiSchema
                {
                    Type = "object",
                    Properties = formFileParameters.ToDictionary(
                        p => p.Name,
                        p => (OpenApiSchema)new OpenApiSchema { Type = "string", Format = "binary" }
                    )
                }
            };

            operation.RequestBody.Content["multipart/form-data"] = mediaType;

            // Eliminar parámetros que Swagger haya listado como query/body
            if (operation.Parameters != null)
            {
                var remove = operation.Parameters.Where(op => formFileParameters.Any(fp => fp.Name == op.Name)).ToList();
                foreach (var r in remove) operation.Parameters.Remove(r);
            }
        }
    }
}
