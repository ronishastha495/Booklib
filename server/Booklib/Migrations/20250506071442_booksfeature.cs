using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booklib.Migrations
{
    /// <inheritdoc />
    public partial class booksfeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAwardWinner",
                table: "Books",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsBestseller",
                table: "Books",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsComingSoon",
                table: "Books",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedDate",
                table: "Books",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "SalesCount",
                table: "Books",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsAwardWinner",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "IsBestseller",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "IsComingSoon",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "PublishedDate",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "SalesCount",
                table: "Books");
        }
    }
}
