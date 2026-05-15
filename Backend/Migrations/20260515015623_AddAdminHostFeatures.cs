using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminHostFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Booking_Voucher_VoucherId",
                table: "Booking");

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "Voucher",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HotelId",
                table: "Voucher",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinNights",
                table: "Voucher",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SuspendReason",
                table: "Hotel",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SuspendedAt",
                table: "Hotel",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "HostProfile",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "HostProfile",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Voucher_CreatedByUserId",
                table: "Voucher",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Voucher_HotelId",
                table: "Voucher",
                column: "HotelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Booking_Voucher_VoucherId",
                table: "Booking",
                column: "VoucherId",
                principalTable: "Voucher",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Voucher_Hotel_HotelId",
                table: "Voucher",
                column: "HotelId",
                principalTable: "Hotel",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Voucher_Users_CreatedByUserId",
                table: "Voucher",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Booking_Voucher_VoucherId",
                table: "Booking");

            migrationBuilder.DropForeignKey(
                name: "FK_Voucher_Hotel_HotelId",
                table: "Voucher");

            migrationBuilder.DropForeignKey(
                name: "FK_Voucher_Users_CreatedByUserId",
                table: "Voucher");

            migrationBuilder.DropIndex(
                name: "IX_Voucher_CreatedByUserId",
                table: "Voucher");

            migrationBuilder.DropIndex(
                name: "IX_Voucher_HotelId",
                table: "Voucher");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Voucher");

            migrationBuilder.DropColumn(
                name: "HotelId",
                table: "Voucher");

            migrationBuilder.DropColumn(
                name: "MinNights",
                table: "Voucher");

            migrationBuilder.DropColumn(
                name: "SuspendReason",
                table: "Hotel");

            migrationBuilder.DropColumn(
                name: "SuspendedAt",
                table: "Hotel");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "HostProfile");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "HostProfile");

            migrationBuilder.AddForeignKey(
                name: "FK_Booking_Voucher_VoucherId",
                table: "Booking",
                column: "VoucherId",
                principalTable: "Voucher",
                principalColumn: "Id");
        }
    }
}
