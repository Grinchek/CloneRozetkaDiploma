using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CloneRozetka.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductAttributesEav : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tblAttributes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DataType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblAttributes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "tblAttributeOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AttributeId = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblAttributeOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_tblAttributeOptions_tblAttributes_AttributeId",
                        column: x => x.AttributeId,
                        principalTable: "tblAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tblCategoryAttributes",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    AttributeId = table.Column<int>(type: "integer", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsFilterable = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblCategoryAttributes", x => new { x.CategoryId, x.AttributeId });
                    table.ForeignKey(
                        name: "FK_tblCategoryAttributes_tblAttributes_AttributeId",
                        column: x => x.AttributeId,
                        principalTable: "tblAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tblCategoryAttributes_tblCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "tblCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tblProductAttributeValues",
                columns: table => new
                {
                    ProductId = table.Column<long>(type: "bigint", nullable: false),
                    AttributeId = table.Column<int>(type: "integer", nullable: false),
                    ValueString = table.Column<string>(type: "text", nullable: true),
                    ValueNumber = table.Column<decimal>(type: "numeric", nullable: true),
                    ValueBool = table.Column<bool>(type: "boolean", nullable: true),
                    OptionId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tblProductAttributeValues", x => new { x.ProductId, x.AttributeId });
                    table.ForeignKey(
                        name: "FK_tblProductAttributeValues_tblAttributeOptions_OptionId",
                        column: x => x.OptionId,
                        principalTable: "tblAttributeOptions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tblProductAttributeValues_tblAttributes_AttributeId",
                        column: x => x.AttributeId,
                        principalTable: "tblAttributes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tblProductAttributeValues_tblProducts_ProductId",
                        column: x => x.ProductId,
                        principalTable: "tblProducts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tblAttributeOptions_AttributeId",
                table: "tblAttributeOptions",
                column: "AttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_tblCategoryAttributes_AttributeId",
                table: "tblCategoryAttributes",
                column: "AttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_tblProductAttributeValues_AttributeId",
                table: "tblProductAttributeValues",
                column: "AttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_tblProductAttributeValues_OptionId",
                table: "tblProductAttributeValues",
                column: "OptionId");

            migrationBuilder.CreateIndex(
                name: "IX_tblProductAttributeValues_ProductId_AttributeId",
                table: "tblProductAttributeValues",
                columns: new[] { "ProductId", "AttributeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tblCategoryAttributes");

            migrationBuilder.DropTable(
                name: "tblProductAttributeValues");

            migrationBuilder.DropTable(
                name: "tblAttributeOptions");

            migrationBuilder.DropTable(
                name: "tblAttributes");
        }
    }
}
