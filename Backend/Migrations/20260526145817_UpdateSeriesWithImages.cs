using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Miro.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSeriesWithImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Delete existing series data
            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 6);

            // Insert updated series data with images and plots
            migrationBuilder.InsertData(
                table: "Series",
                columns: new[] { "Id", "BackdropUrl", "Creator", "FirstAirDate", "Genre", "Language", "LastAirDate", "NumberOfEpisodes", "NumberOfSeasons", "Plot", "PosterUrl", "Rating", "Status", "Title", "TmdbId" },
                values: new object[,]
                {
                    { 1, null, "Vince Gilligan", new DateTime(2008, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Crime, Drama, Thriller", "en", new DateTime(2013, 9, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 62, 5, "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's financial future.", "https://image.tmdb.org/t/p/w500/ggJZtGjWsIHe4R1IY93gXvnWEYH.jpg", 9.5, "Ended", "Breaking Bad", 1399 },
                    { 2, null, "David Crane, Marta Kauffman", new DateTime(1994, 9, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), "Comedy, Romance", "en", new DateTime(2004, 5, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 236, 10, "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in the New York City borough of Manhattan.", "https://image.tmdb.org/t/p/w500/f496cm9sPdJjIB9yalMQWXKc5Gg.jpg", 8.9000000000000004, "Ended", "Friends", 1668 },
                    { 3, null, "Peter Morgan", new DateTime(2016, 11, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), "Biography, Drama, History", "en", new DateTime(2022, 11, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 50, 5, "Follows the political rivalries and romance of Queen Elizabeth II, and the events that shaped the second half of the twentieth century.", "https://image.tmdb.org/t/p/w500/lFSIGwDSapQj1vRsPGQUVcKcsxh.jpg", 8.5999999999999996, "Ended", "The Crown", 1396 },
                    { 4, null, "Greg Daniels", new DateTime(2005, 3, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), "Comedy", "en", new DateTime(2013, 5, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 201, 9, "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.", "https://image.tmdb.org/t/p/w500/wSp8gG1dCOo6dBvXSnoow6CaAdb.jpg", 9.0, "Ended", "The Office", 1402 },
                    { 5, null, "The Duffer Brothers", new DateTime(2016, 7, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Drama, Fantasy, Horror", "en", new DateTime(2022, 7, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 42, 4, "When a young boy disappears, his friends, family and local police uncover a mystery involving secret government experiments, terrifying supernatural forces and a strange little girl.", "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", 8.6999999999999993, "Ended", "Stranger Things", 1407 },
                    { 6, null, "David Benioff, D. B. Weiss", new DateTime(2011, 4, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), "Action, Adventure, Drama", "en", new DateTime(2019, 5, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 73, 8, "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.", "https://image.tmdb.org/t/p/w500/u3bZgnEu2PAok7onUZdPiT6inVt.jpg", 9.1999999999999993, "Ended", "Game of Thrones", 1418 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Delete updated series data
            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Series",
                keyColumn: "Id",
                keyValue: 6);

            // Insert original series data without images and plots
            migrationBuilder.InsertData(
                table: "Series",
                columns: new[] { "Id", "BackdropUrl", "Creator", "FirstAirDate", "Genre", "Language", "LastAirDate", "NumberOfEpisodes", "NumberOfSeasons", "Plot", "PosterUrl", "Rating", "Status", "Title", "TmdbId" },
                values: new object[,]
                {
                    { 1, null, "Vince Gilligan", new DateTime(2008, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Crime, Drama, Thriller", "en", new DateTime(2013, 9, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), 62, 5, null, null, 9.5, "Ended", "Breaking Bad", 1399 },
                    { 2, null, "David Crane, Marta Kauffman", new DateTime(1994, 9, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), "Comedy, Romance", "en", new DateTime(2004, 5, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 236, 10, null, null, 8.9000000000000004, "Ended", "Friends", 1668 },
                    { 3, null, "Peter Morgan", new DateTime(2016, 11, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), "Biography, Drama, History", "en", new DateTime(2022, 11, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 50, 5, null, null, 8.5999999999999996, "Ended", "The Crown", 1396 },
                    { 4, null, "Greg Daniels", new DateTime(2005, 3, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), "Comedy", "en", new DateTime(2013, 5, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 201, 9, null, null, 9.0, "Ended", "The Office", 1402 },
                    { 5, null, "The Duffer Brothers", new DateTime(2016, 7, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Drama, Fantasy, Horror", "en", new DateTime(2022, 7, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 42, 4, null, null, 8.6999999999999993, "Ended", "Stranger Things", 1407 },
                    { 6, null, "David Benioff, D. B. Weiss", new DateTime(2011, 4, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), "Action, Adventure, Drama", "en", new DateTime(2019, 5, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 73, 8, null, null, 9.1999999999999993, "Ended", "Game of Thrones", 1418 }
                });
        }
    }
}

