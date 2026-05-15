using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoomManagement.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBusinessLicenseToList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BusinessLicenseUrl",
                table: "HostProfile",
                newName: "BusinessLicenseUrls");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BusinessLicenseUrls",
                table: "HostProfile",
                newName: "BusinessLicenseUrl");
        }
    }
}
