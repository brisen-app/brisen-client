import SupabaseEntity from "./SupabaseEntity";
import Category from "./Category";
import UUID from "./uuid"
import { NotFoundError } from "./Errors";

export default class Card extends SupabaseEntity {
    protected static readonly tableName: string = "cards"
    get id() { return super.id as UUID }
    private get header() { return this.data.header as string | null }
    get content() { return this.data.content as string }
    get category() { return this.data.category as string | null }

    async fetchCategory() {
        if (!this.data.category) throw new NotFoundError(`Card '${this.id}' has no category.`);
        return await Category.fetch(this.data.category)
    }
}