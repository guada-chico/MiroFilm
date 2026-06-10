using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Miro.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WatchingStatuses_Movies_MovieId",
                table: "WatchingStatuses");

            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "WatchingStatuses",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "WatchingStatuses",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "SeriesId",
                table: "WatchingStatuses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "WatchingStatuses",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_WatchingStatuses_SeriesId",
                table: "WatchingStatuses",
                column: "SeriesId");

            migrationBuilder.AddForeignKey(
                name: "FK_WatchingStatuses_Movies_MovieId",
                table: "WatchingStatuses",
                column: "MovieId",
                principalTable: "Movies",
                principalColumn: "Id");

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
                name: "FK_WatchingStatuses_Movies_MovieId",
                table: "WatchingStatuses");

            migrationBuilder.DropForeignKey(
                name: "FK_WatchingStatuses_Series_SeriesId",
                table: "WatchingStatuses");

            migrationBuilder.DropIndex(
                name: "IX_WatchingStatuses_SeriesId",
                table: "WatchingStatuses");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "WatchingStatuses");

            migrationBuilder.DropColumn(
                name: "SeriesId",
                table: "WatchingStatuses");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "WatchingStatuses");

            migrationBuilder.AlterColumn<int>(
                name: "MovieId",
                table: "WatchingStatuses",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_WatchingStatuses_Movies_MovieId",
                table: "WatchingStatuses",
                column: "MovieId",
                principalTable: "Movies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
