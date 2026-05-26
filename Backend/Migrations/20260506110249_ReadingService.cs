using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Miro.Migrations
{
    /// <inheritdoc />
    public partial class SistemaLectura : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentPage",
                table: "ReadingStatuses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ReadingStatuses_BookId",
                table: "ReadingStatuses",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingStatuses_UserId",
                table: "ReadingStatuses",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReadingStatuses_Books_BookId",
                table: "ReadingStatuses",
                column: "BookId",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReadingStatuses_Users_UserId",
                table: "ReadingStatuses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReadingStatuses_Books_BookId",
                table: "ReadingStatuses");

            migrationBuilder.DropForeignKey(
                name: "FK_ReadingStatuses_Users_UserId",
                table: "ReadingStatuses");

            migrationBuilder.DropIndex(
                name: "IX_ReadingStatuses_BookId",
                table: "ReadingStatuses");

            migrationBuilder.DropIndex(
                name: "IX_ReadingStatuses_UserId",
                table: "ReadingStatuses");

            migrationBuilder.DropColumn(
                name: "CurrentPage",
                table: "ReadingStatuses");
        }
    }
}
