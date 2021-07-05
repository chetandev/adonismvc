import BaseSchema from "@ioc:Adonis/Lucid/Schema";
export default class Posts extends BaseSchema {
  protected tableName = "posts";
  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("title", 255).notNullable();
      table.string("content", 255).notNullable();
      table.integer("user_id", 180).notNullable();
      table.integer("forum_id").nullable();
      table.timestamps(true);
    });
  }
  public async down() {
    this.schema.dropTable(this.tableName);
  }
}