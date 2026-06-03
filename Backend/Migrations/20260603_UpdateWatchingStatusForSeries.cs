using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Miro.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWatchingStatusForSeries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Hacer MovieId nullable
            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "WatchingStatuses",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            // Agregar SeriesId
            migrationBuilder.AddColumn<int>(
                name: "SeriesId",
                table: "WatchingStatuses",
                type: "int",
                nullable: true);

            // Agregar CreatedAt
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "WatchingStatuses",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2026, 6, 3, 0, 0, 0, 0, DateTimeKind.Utc));

            // Agregar UpdatedAt
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "WatchingStatuses",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2026, 6, 3, 0, 0, 0, 0, DateTimeKind.Utc));

            // Crear índice para SeriesId
            migrationBuilder.CreateIndex(
                name: "IX_WatchingStatuses_SeriesId",
                table: "WatchingStatuses",
                column: "SeriesId");

            // Crear Foreign Key para Series
            migrationBuilder.AddForeignKey(
                name: "FK_WatchingStatuses_Series_SeriesId",
                table: "WatchingStatuses",
                column: "SeriesId",
                principalTable: "Series",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WatchingStatuses_Series_SeriesId",
                table: "WatchingStatuses");

            migrationBuilder.DropIndex(
                name: "IX_WatchingStatuses_SeriesId",
                table: "WatchingStatuses");

            migrationBuilder.DropColumn(
                name: "SeriesId",
                table: "WatchingStatuses");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "WatchingStatuses");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "WatchingStatuses");

            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "WatchingStatuses",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
