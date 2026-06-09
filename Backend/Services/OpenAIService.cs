using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;
using Miro.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Miro.Services
{
    public class OpenAIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _model;

        public OpenAIService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["OpenAI:ApiKey"] ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
            _model = configuration["OpenAI:Model"] ?? "gpt-3.5-turbo";

            if (!string.IsNullOrWhiteSpace(_apiKey))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
                _httpClient.BaseAddress = new Uri("https://api.openai.com/");
            }
        }

        public async Task<string> GetChatResponseAsync(string message, List<object> conversationHistory = null)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                throw new InvalidOperationException("OpenAI API key not configured");
            }

            var messages = new List<object>();

            // System prompt to guide the assistant (Spanish)
            messages.Add(new { role = "system", content = "Eres un asistente útil de MiroFilm. Responde en español de forma breve y clara." });

            if (conversationHistory != null)
            {
                // conversationHistory expected to be a list of { role, content }
                foreach (var item in conversationHistory)
                {
                    messages.Add(item);
                }
            }

            messages.Add(new { role = "user", content = message });

            var payload = new
            {
                model = _model,
                messages = messages,
                max_tokens = 512,
                temperature = 0.6
            };

            var json = JsonSerializer.Serialize(payload);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            var res = await _httpClient.PostAsync("v1/chat/completions", content);
            var body = await res.Content.ReadAsStringAsync();

            if (!res.IsSuccessStatusCode)
            {
                throw new Exception($"OpenAI API error: {res.StatusCode} - {body}");
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
            {
                var messageElem = choices[0].GetProperty("message");
                if (messageElem.TryGetProperty("content", out var contentElem))
                {
                    return contentElem.GetString() ?? string.Empty;
                }
            }

            return string.Empty;
        }
    }
}
