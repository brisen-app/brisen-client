import SupabaseEntity from "./SupabaseEntity";

export default class Category extends SupabaseEntity {
    protected static readonly tableName: string = "categories"
    get id() { return super.id as string }
    get icon() { return this.data.icon as string }
    get color() { return this.data.color as string | null }
}