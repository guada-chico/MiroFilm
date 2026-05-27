using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Miro.Migrations
{
    /// <inheritdoc />
    public partial class AddMovieSeriesFavorites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SeriesId",
                table: "Favorites",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TmdbMovieId",
                table: "Favorites",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TmdbSeriesId",
                table: "Favorites",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_SeriesId",
                table: "Favorites",
                column: "SeriesId");

            migrationBuilder.AddForeignKey(
                name: "FK_Favorites_Series_SeriesId",
                table: "Favorites",
                column: "SeriesId",
                principalTable: "Series",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Favorites_Series_SeriesId",
                table: "Favorites");

            migrationBuilder.DropIndex(
                name: "IX_Favorites_SeriesId",
                table: "Favorites");

            migrationBuilder.DropColumn(
                name: "SeriesId",
                table: "Favorites");

            migrationBuilder.DropColumn(
                name: "TmdbMovieId",
                table: "Favorites");

            migrationBuilder.DropColumn(
                name: "TmdbSeriesId",
                table: "Favorites");
        }
    }
}
