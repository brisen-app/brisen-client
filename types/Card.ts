import SupabaseEntity from "./SupabaseEntity";
import Category from "./Category";
import UUID from "./uuid"

export default class Card extends SupabaseEntity {
    protected static readonly tableName: string = "cards"
    get id() { return super.id as UUID }
    private get header() { return this.data.header as string | null }
    get content() { return this.data.content as string }
    get category() { return (async () => {
        if (!this.data.category) return null;
        return await Category.fetch(this.data.category)
    })()}
}