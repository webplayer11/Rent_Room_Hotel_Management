using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomManagement.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAccountModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customer_Account_AccountId",
                table: "Customer");

            migrationBuilder.DropForeignKey(
                name: "FK_HotelImage_Hotel_HotelId",
                table: "HotelImage");

            migrationBuilder.DropForeignKey(
                name: "FK_HotelOwner_Account_AccountId",
                table: "HotelOwner");

            migrationBuilder.DropTable(
                name: "Account");

            migrationBuilder.DropIndex(
                name: "IX_HotelOwner_AccountId",
                table: "HotelOwner");

            migrationBuilder.DropIndex(
                name: "IX_Customer_AccountId",
                table: "Customer");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "HotelOwner");

            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "Customer");

            migrationBuilder.AddForeignKey(
                name: "FK_HotelImage_Hotel_HotelId",
                table: "HotelImage",
                column: "HotelId",
                principalTable: "Hotel",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HotelImage_Hotel_HotelId",
                table: "HotelImage");

            migrationBuilder.AddColumn<string>(
                name: "AccountId",
                table: "HotelOwner",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountId",
                table: "Customer",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Account",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Account", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HotelOwner_AccountId",
                table: "HotelOwner",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Customer_AccountId",
                table: "Customer",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Account_Email",
                table: "Account",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Customer_Account_AccountId",
                table: "Customer",
                column: "AccountId",
                principalTable: "Account",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HotelImage_Hotel_HotelId",
                table: "HotelImage",
                column: "HotelId",
                principalTable: "Hotel",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_HotelOwner_Account_AccountId",
                table: "HotelOwner",
                column: "AccountId",
                principalTable: "Account",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
